const express = require('express');
const router = express.Router();
const passport = require('passport');
const generateToken = require('../utils/generateToken');
const {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress,
    addToWishlist,
    removeFromWishlist,
    getUserWishlist,
    addRecentlyViewed,
    getRecentlyViewed,
    verifyLogin2FA
} = require('../controllers/userController');
const {
    setup2FA,
    verifyAndEnable2FA,
    disable2FA
} = require('../controllers/twoFactorController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/login', authUser);
router.post('/login/2fa', verifyLogin2FA);
router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// Address management routes
router.route('/addresses')
    .post(protect, addUserAddress);
router.route('/addresses/:addressId')
    .put(protect, updateUserAddress)
    .delete(protect, deleteUserAddress);

// Wishlist routes
router.route('/wishlist')
    .get(protect, getUserWishlist);
router.route('/wishlist/:productId')
    .post(protect, addToWishlist)
    .delete(protect, removeFromWishlist);

// Recently viewed routes
router.route('/recently-viewed')
    .get(protect, getRecentlyViewed);
router.route('/recently-viewed/:productId')
    .post(protect, addRecentlyViewed);

// 2FA Routes
router.post('/2fa/setup', protect, setup2FA);
router.post('/2fa/verify', protect, verifyAndEnable2FA);
router.post('/2fa/disable', protect, disable2FA);

// Google OAuth routes
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth' }),
    (req, res) => {
        try {
            if (!req.user) {
                console.error('Google OAuth: No user found');
                return res.redirect(`${process.env.FRONTEND_URL}/auth?error=google_auth_failed`);
            }
            
            console.log('Google OAuth successful for user:', req.user.email);
            
            // Generate JWT token
            const token = generateToken(req.user._id);
            
            // Create user data object
            const userData = {
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                isAdmin: req.user.isAdmin,
                token: token
            };
            
            // Redirect to frontend with token in URL hash (to avoid CORS issues)
            // Using hash instead of query params for security
            const userDataEncoded = Buffer.from(JSON.stringify(userData)).toString('base64');
            res.redirect(`${process.env.FRONTEND_URL}/auth#token=${token}&user=${userDataEncoded}`);
        } catch (error) {
            console.error('Google OAuth callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/auth?error=callback_error`);
        }
    }
);

module.exports = router;
