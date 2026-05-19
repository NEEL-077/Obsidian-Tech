const express = require('express');
const router = express.Router();
const {
    createCoupon,
    getCoupons,
    validateCoupon,
    applyCoupon,
    updateCoupon,
    deleteCoupon
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin routes
router.route('/')
    .get(protect, admin, getCoupons)
    .post(protect, admin, createCoupon);

router.route('/:id')
    .put(protect, admin, updateCoupon)
    .delete(protect, admin, deleteCoupon);

// User routes
router.post('/validate', protect, validateCoupon);
router.post('/apply', protect, applyCoupon);

module.exports = router;