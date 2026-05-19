const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductInventory,
    getLowStockProducts,
    getInventoryReport
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/low-stock').get(protect, admin, getLowStockProducts);
router.route('/inventory-report').get(protect, admin, getInventoryReport);
router.route('/:id/inventory').put(protect, admin, updateProductInventory);
router
    .route('/:id')
    .get(getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

module.exports = router;
