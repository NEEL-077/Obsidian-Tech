const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController');
const { getUsers } = require('../controllers/userController');
const { getOrders } = require('../controllers/orderController');
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect, admin);

// Admin Dashboard Stats
router.route('/stats').get(getDashboardStats);

// Admin User Management
router.route('/users').get(getUsers);

// Admin Order Management
router.route('/orders').get(getOrders);

// Admin Product Management
router.route('/products')
    .get(getProducts)
    .post(createProduct);

router.route('/products/:id')
    .put(updateProduct)
    .delete(deleteProduct);

module.exports = router;
