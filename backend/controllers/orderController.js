const supabase = require('../config/supabase');
const { sendOrderConfirmation, sendOrderStatusUpdate, sendOrderDelivered } = require('../utils/emailService');
const { sendOrderPlacedEmail, updateOrderStatus, getOrderEmailStatus, resendOrderEmail, ORDER_STATUS } = require('../services/orderNotificationService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    try {
        const {
            orderItems, 
            shippingAddress, 
            paymentMethod,
            totalPrice
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // 1. Insert order into public.orders
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([{
                user_id: req.user._id,
                total_price: totalPrice,
                shipping_address: shippingAddress,
                payment_method: paymentMethod,
                is_paid: false,
                is_delivered: false
            }])
            .select();

        if (orderError) throw orderError;
        const createdOrder = orderData[0];

        // 2. Insert items into public.order_items
        const formattedItems = orderItems.map(item => ({
            order_id: createdOrder.id,
            product_id: item.product,
            name: item.name,
            qty: item.qty,
            price: item.price,
            image_url: item.image
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(formattedItems);

        if (itemsError) throw itemsError;

        res.status(201).json({ ...createdOrder, _id: createdOrder.id, orderItems });
    } catch (error) {
        console.error('❌ Error creating order:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order && (String(order.user) === String(req.user._id) || req.user.isAdmin)) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch(err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatusController = async (req, res) => {
    try {
        const { status, note, trackingNumber, carrier, estimatedDelivery } = req.body;
        
        // Validate status
        if (!Object.values(ORDER_STATUS).includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status',
                validStatuses: Object.values(ORDER_STATUS)
            });
        }

        const options = {
            note,
            trackingNumber,
            carrier,
            estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
        };

        const result = await updateOrderStatus(req.params.id, status, options);

        if (!result.success) {
            return res.status(404).json({ message: result.error });
        }

        res.json({
            success: true,
            order: result.order,
            previousStatus: result.previousStatus,
            newStatus: status,
            emailSent: result.emailSent,
            emailError: result.emailError,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (String(order.user) !== String(req.user._id) && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        order.isPaid = true;
        order.paidAt = new Date().toISOString();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.payer?.email_address
        };

        if(!order.statusHistory) order.statusHistory = [];
        order.set('orderStatus', 'confirmed');
        order.statusHistory.push({
            status: 'confirmed',
            timestamp: new Date().toISOString(),
            note: 'Payment confirmed successfully'
        });

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 }).populate('user', 'name email');
        res.json(orders);
    } catch(err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (String(order.user) !== String(req.user._id) && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const currentStatus = order.get('orderStatus');
        if (['shipped', 'delivered'].includes(currentStatus)) {
            return res.status(400).json({ message: 'Cannot cancel shipped or delivered orders' });
        }

        order.set('orderStatus', 'cancelled');
        if(!order.statusHistory) order.statusHistory = [];
        order.statusHistory.push({
            status: 'cancelled',
            timestamp: new Date().toISOString(),
            note: req.body.reason || 'Order cancelled by customer'
        });

        // Restore product stock
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.countInStock = product.countInStock + item.qty;
                product.lowStock = product.countInStock <= (product.lowStockThreshold || 5) && product.countInStock > 0;
                await product.save();
            }
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
    try {
        const result = await updateOrderStatus(req.params.id, ORDER_STATUS.DELIVERED);
        
        if (!result.success) {
            return res.status(404).json({ message: result.error });
        }

        res.json({
            success: true,
            order: result.order,
            emailSent: result.emailSent,
        });
    } catch(err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Get order email status
// @route   GET /api/orders/:id/email-status
// @access  Private/Admin
const getOrderEmailStatusController = async (req, res) => {
    try {
        const result = await getOrderEmailStatus(req.params.id);
        
        if (!result.success) {
            return res.status(404).json({ message: result.error });
        }

        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Resend order email
// @route   POST /api/orders/:id/resend-email
// @access  Private/Admin
const resendOrderEmailController = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status || !Object.values(ORDER_STATUS).includes(status)) {
            return res.status(400).json({ 
                message: 'Valid status is required',
                validStatuses: Object.values(ORDER_STATUS)
            });
        }

        const result = await resendOrderEmail(req.params.id, status);
        
        if (!result.success) {
            return res.status(400).json({ message: result.error });
        }

        res.json({
            success: true,
            message: `Email resent for status: ${status}`,
            emailSent: result.success,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { 
    addOrderItems, 
    getOrderById, 
    updateOrderToPaid, 
    updateOrderToDelivered, 
    getMyOrders, 
    getOrders,
    updateOrderStatus: updateOrderStatusController,
    cancelOrder,
    getOrderEmailStatus: getOrderEmailStatusController,
    resendOrderEmail: resendOrderEmailController,
};
