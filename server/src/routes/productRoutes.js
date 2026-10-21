const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAdmin, optionalAuth } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', optionalAuth, productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/categories', optionalAuth, productController.getCategories);
router.get('/:id', optionalAuth, productController.getProductById);

// Admin-only management routes
router.post('/', requireAdmin, productController.createProduct);
router.put('/:id', requireAdmin, productController.updateProduct);
router.patch('/:id/price', requireAdmin, productController.updatePrice);
router.patch('/:id/variants/:variantId/stock', requireAdmin, productController.updateInventory);
router.delete('/:id', requireAdmin, productController.deleteProduct);
router.delete('/:id/archive', requireAdmin, productController.archiveProduct);
router.post('/upload-image', requireAdmin, uploadSingle, productController.uploadImage);

// Category routes (Admin)
router.post('/categories', requireAdmin, productController.createCategory);
router.put('/categories/:id', requireAdmin, productController.updateCategory);
router.delete('/categories/:id', requireAdmin, productController.deleteCategory);

module.exports = router;
