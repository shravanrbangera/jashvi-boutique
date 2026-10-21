const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { requireAdmin } = require('../middleware/authMiddleware');

// Public store info
router.get('/', settingsController.getSettings);

// Admin-only updates
router.put('/', requireAdmin, settingsController.updateSettings);

module.exports = router;
