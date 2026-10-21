const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.post('/', requireAuth, returnController.createReturnRequest);
router.get('/my-returns', requireAuth, returnController.getMyReturns);
router.get('/track/:returnNumber', returnController.trackReturn);

// Admin returns & refunds
router.get('/', requireAdmin, returnController.getAllReturns);
router.patch('/:id/status', requireAdmin, returnController.updateReturnStatus);
router.post('/:id/refund', requireAdmin, returnController.recordRefund);

module.exports = router;
