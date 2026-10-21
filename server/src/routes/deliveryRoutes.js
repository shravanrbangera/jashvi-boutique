const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { requireAdmin } = require('../middleware/authMiddleware');

// Public PIN code serviceability check
router.post('/check', deliveryController.checkPincode);

// Admin delivery zone routes
router.get('/zones', requireAdmin, deliveryController.getAllDeliveryZones);
router.post('/zones', requireAdmin, deliveryController.createDeliveryZone);
router.put('/zones/:id', requireAdmin, deliveryController.updateDeliveryZone);

module.exports = router;
