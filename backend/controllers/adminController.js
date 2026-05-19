



// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalProducts = await Product.countDocuments({});
        const totalOrders = await Order.countDocuments({});

        // Calculate total sales from paid orders
        const paidOrders = await Order.find({ isPaid: true });
        const totalSales = paidOrders.reduce((acc, order) => acc + order.totalPrice, 0);

        // Fetch recent 5 orders
        const recentOrdersDb = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email');

        const recentOrders = recentOrdersDb.map(o => {
            // Re-map populated user for frontend compatibility (user: { name, email })
            const plainOrder = o.toObject();
            if (plainOrder.user && plainOrder.user.name) {
                // leave as is, since frontend expects user.name and user.email
            } else {
                plainOrder.user = { name: plainOrder.userName || 'Unknown', email: plainOrder.userEmail || 'unknown' };
            }
            return plainOrder;
        });

        res.json({ totalUsers, totalProducts, totalOrders, totalSales, recentOrders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };
