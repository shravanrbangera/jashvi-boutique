const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Customer endpoints (Login required for placing order)
router.post('/', requireAuth, orderController.createOrder);
router.get('/my-orders', requireAuth, orderController.getMyOrders);
router.get('/:id', requireAuth, orderController.getOrderDetails);

// Public Order Tracking with phone verification
router.post('/track', orderController.trackOrder);

// Admin-only order management
router.get('/', requireAdmin, orderController.getAllOrders);
router.patch('/:id/fulfillment', requireAdmin, orderController.updateFulfillmentStatus);
router.post('/:id/cancel', requireAdmin, orderController.cancelOrder);

module.exports = router;
