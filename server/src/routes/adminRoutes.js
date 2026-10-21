const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminDashboardController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.use(requireAdmin);

router.get('/overview', adminController.getOverviewStats);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/reports', adminController.getReports);
router.get('/customers', adminController.getCustomers);

module.exports = router;
