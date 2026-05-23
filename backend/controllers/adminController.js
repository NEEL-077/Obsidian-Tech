const supabase = require('../config/supabase');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // Count users
        const { count: totalUsers, error: usersError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        // Count products
        const { count: totalProducts, error: productsError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

        // Count orders
        const { count: totalOrders, error: ordersError } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });

        if (usersError) throw usersError;
        if (productsError) throw productsError;
        if (ordersError) throw ordersError;

        // Calculate total sales from paid orders
        const { data: paidOrders, error: paidError } = await supabase
            .from('orders')
            .select('total_price')
            .eq('is_paid', true);

        if (paidError) throw paidError;

        const totalSales = (paidOrders || []).reduce((acc, order) => acc + (order.total_price || 0), 0);

        // Fetch recent 5 orders with user info
        const { data: recentOrdersDb, error: recentError } = await supabase
            .from('orders')
            .select(`id, total_price, is_paid, is_delivered, created_at, order_status, users(name, email)`)
            .order('created_at', { ascending: false })
            .limit(5);

        if (recentError) throw recentError;

        const recentOrders = (recentOrdersDb || []).map(o => ({
            _id: o.id,
            totalPrice: o.total_price,
            isPaid: o.is_paid,
            isDelivered: o.is_delivered,
            createdAt: o.created_at,
            orderStatus: o.order_status,
            user: o.users
                ? { name: o.users.name, email: o.users.email }
                : { name: 'Unknown', email: 'unknown' },
        }));

        res.json({ totalUsers, totalProducts, totalOrders, totalSales, recentOrders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };
