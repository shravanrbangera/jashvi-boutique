const Order = require('../models/Order');
const Product = require('../models/Product');
const ReturnRequest = require('../models/ReturnRequest');
const AdminAuditLog = require('../models/AdminAuditLog');
const User = require('../models/User');

/**
 * Get aggregated dashboard overview statistics directly from DB
 */
async function getOverviewStats(req, res, next) {
  try {
    const totalProducts = await Product.countDocuments({ isArchived: false });
    const activeProducts = await Product.countDocuments({ status: 'published', isArchived: false });

    // Inventory status analysis
    const allProducts = await Product.find({ isArchived: false }).select('variants name sku');
    let lowStockVariantsCount = 0;
    let outOfStockVariantsCount = 0;

    allProducts.forEach((p) => {
      p.variants.forEach((v) => {
        if (v.stock <= 0) {
          outOfStockVariantsCount++;
        } else if (v.stock <= 3) {
          lowStockVariantsCount++;
        }
      });
    });

    // Orders stats
    const totalOrders = await Order.countDocuments();
    const pendingFulfillmentOrders = await Order.countDocuments({
      fulfillmentStatus: { $in: ['Placed', 'Confirmed', 'Processing', 'Packed'] },
    });
    const pendingPaymentOrders = await Order.countDocuments({
      'payment.status': 'PENDING',
      'payment.method': 'ONLINE',
    });

    // Confirmed Revenue from verified PAID transactions
    const paidOrders = await Order.find({ 'payment.status': 'PAID' }).select('pricing.finalTotal');
    const confirmedRevenue = paidOrders.reduce((sum, o) => sum + (o.pricing.finalTotal || 0), 0);

    // Returns stats
    const pendingReturns = await ReturnRequest.countDocuments({
      status: { $in: ['Requested', 'Under Review', 'Awaiting Returned Item'] },
    });
    const awaitingRefund = await ReturnRequest.countDocuments({
      status: 'Refund Processing',
    });

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('orderNumber user pricing payment fulfillmentStatus createdAt')
      .lean();

    // Total registered customers
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    res.json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        lowStockVariantsCount,
        outOfStockVariantsCount,
        totalOrders,
        pendingFulfillmentOrders,
        pendingPaymentOrders,
        confirmedRevenue,
        pendingReturns,
        awaitingRefund,
        totalCustomers,
      },
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get filterable Admin Audit Logs
 */
async function getAuditLogs(req, res, next) {
  try {
    const { action, entityType, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await AdminAuditLog.countDocuments(filter);
    const logs = await AdminAuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      logs,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Reports and Sales analytics
 */
async function getReports(req, res, next) {
  try {
    // Payment breakdown
    const codOrders = await Order.countDocuments({ 'payment.method': 'COD' });
    const onlineOrders = await Order.countDocuments({ 'payment.method': 'ONLINE' });

    // Fulfillment status breakdown
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$fulfillmentStatus', count: { $sum: 1 } } },
    ]);

    // Top selling products by order count
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalSales: { $sum: '$items.lineTotal' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      reports: {
        paymentBreakdown: {
          cod: codOrders,
          online: onlineOrders,
        },
        fulfillmentBreakdown: statusCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        topProducts,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Get registered customers
 */
async function getCustomers(req, res, next) {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = { role: 'customer' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const customers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      customers,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOverviewStats,
  getAuditLogs,
  getReports,
  getCustomers,
};
