const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Customer payment verification
router.post('/verify', requireAuth, paymentController.verifyOnlinePayment);

// Admin COD collection & reconciliation
router.post('/orders/:orderId/cod-collect', requireAdmin, paymentController.recordCODCollection);

module.exports = router;
