const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { optionalAuth, requireAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, cartController.getCart);
router.post('/items', optionalAuth, cartController.addToCart);
router.patch('/items/:itemId', optionalAuth, cartController.updateCartItem);
router.delete('/items/:itemId', optionalAuth, cartController.removeCartItem);
router.post('/merge', requireAuth, cartController.mergeGuestCart);

module.exports = router;
