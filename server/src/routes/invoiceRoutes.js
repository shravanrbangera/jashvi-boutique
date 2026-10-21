const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', requireAdmin, invoiceController.listInvoices);
router.get('/:identifier', requireAuth, invoiceController.getInvoice);
router.post('/:id/adjust', requireAdmin, invoiceController.adjustInvoice);
router.post('/:id/approve', requireAdmin, invoiceController.approveInvoice);
router.get('/:id/adjustments', requireAdmin, invoiceController.getAdjustmentHistory);

module.exports = router;
