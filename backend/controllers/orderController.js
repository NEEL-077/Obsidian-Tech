const supabase = require('../config/supabase');
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

        // BUG #2 FIX: Send order confirmation email after successful order creation
        try {
            const orderForEmail = {
                _id: createdOrder.id,
                userName: req.user.name,
                userEmail: req.user.email,
                totalPrice: createdOrder.total_price,
                shippingPrice: 0,
                taxPrice: 0,
                orderItems: orderItems.map(item => ({
                    name: item.name,
                    qty: item.qty,
                    price: item.price,
                    image: item.image,
                })),
                shippingAddress: shippingAddress,
                paymentMethod: paymentMethod,
                createdAt: createdOrder.created_at || new Date().toISOString(),
                emailNotifications: {},
                save: async () => {} // no-op since we use Supabase not Mongoose
            };
            await sendOrderPlacedEmail(orderForEmail);
        } catch (emailErr) {
            console.error('⚠️ Order confirmation email failed (order was still created):', emailErr.message);
        }

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
        const { data: order, error } = await supabase
            .from('orders')
            .select(`*, order_items(*)`)
            .eq('id', req.params.id)
            .single();

        if (error || !order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only allow the owner or an admin to view the order
        if (order.user_id !== req.user._id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json({
            ...order,
            _id: order.id,
            isPaid: order.is_paid,
            isDelivered: order.is_delivered,
            orderItems: (order.order_items || []).map(i => ({
                ...i,
                product: i.product_id,
                image: i.image_url,
            })),
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

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
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (fetchError || !order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user_id !== req.user._id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { data: updatedOrder, error: updateError } = await supabase
            .from('orders')
            .update({
                is_paid: true,
                paid_at: new Date().toISOString(),
                payment_result: {
                    id: req.body.id,
                    status: req.body.status,
                    update_time: req.body.update_time,
                    email_address: req.body.payer?.email_address
                },
                order_status: 'confirmed',
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (updateError) throw updateError;
        res.json({ ...updatedOrder, _id: updatedOrder.id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`*, order_items(*)`)
            .eq('user_id', req.user._id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json((orders || []).map(o => ({
            ...o,
            _id: o.id,
            isPaid: o.is_paid,
            isDelivered: o.is_delivered,
            orderItems: (o.order_items || []).map(i => ({
                ...i,
                product: i.product_id,
                image: i.image_url,
            })),
        })));
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`*, order_items(*), users(name, email)`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json((orders || []).map(o => ({
            ...o,
            _id: o.id,
            isPaid: o.is_paid,
            isDelivered: o.is_delivered,
            user: o.users ? { name: o.users.name, email: o.users.email } : null,
            orderItems: (o.order_items || []).map(i => ({
                ...i,
                product: i.product_id,
                image: i.image_url,
            })),
        })));
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
    try {
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select(`*, order_items(*)`)
            .eq('id', req.params.id)
            .single();

        if (fetchError || !order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user_id !== req.user._id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const currentStatus = order.order_status || 'pending';
        if (['shipped', 'delivered'].includes(currentStatus.toLowerCase())) {
            return res.status(400).json({ message: 'Cannot cancel shipped or delivered orders' });
        }

        const { data: updatedOrder, error: updateError } = await supabase
            .from('orders')
            .update({ order_status: 'cancelled' })
            .eq('id', req.params.id)
            .select()
            .single();

        if (updateError) throw updateError;

        // Restore product stock for each cancelled item
        for (const item of (order.order_items || [])) {
            const { data: product } = await supabase
                .from('products')
                .select('count_in_stock')
                .eq('id', item.product_id)
                .single();

            if (product) {
                await supabase
                    .from('products')
                    .update({ count_in_stock: product.count_in_stock + item.qty })
                    .eq('id', item.product_id);
            }
        }

        res.json({ ...updatedOrder, _id: updatedOrder.id });
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
    } catch (err) {
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
