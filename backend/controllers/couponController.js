// NOTE: Coupon management requires a 'coupons' table in Supabase.
// The table schema should include: code, description, discount_type, discount_value,
// min_order_amount, max_discount_amount, usage_limit, used_count, valid_from, valid_until,
// applicable_categories, applicable_brands, is_active, created_by.
// Until the table is created and migrated, all endpoints return 501 Not Implemented.

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
    res.status(501).json({ message: 'Coupon management requires a coupons table in Supabase. Not yet implemented.' });
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
    res.status(501).json({ message: 'Coupon management requires a coupons table in Supabase. Not yet implemented.' });
};

// @desc    Validate and apply coupon
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res) => {
    res.status(501).json({ message: 'Coupon management requires a coupons table in Supabase. Not yet implemented.' });
};

// @desc    Apply coupon to order
// @route   POST /api/coupons/apply
// @access  Private
// BUG #6 FIX NOTE: When reimplementing applyCoupon, always re-validate the coupon
// (expiry, usage limit, min order amount) BEFORE incrementing usedCount.
// Do NOT rely solely on validateCoupon being called first, since they are separate endpoints.
const applyCoupon = async (req, res) => {
    res.status(501).json({ message: 'Coupon management requires a coupons table in Supabase. Not yet implemented.' });
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
    res.status(501).json({ message: 'Coupon management requires a coupons table in Supabase. Not yet implemented.' });
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
    res.status(501).json({ message: 'Coupon management requires a coupons table in Supabase. Not yet implemented.' });
};

module.exports = {
    createCoupon,
    getCoupons,
    validateCoupon,
    applyCoupon,
    updateCoupon,
    deleteCoupon
};
