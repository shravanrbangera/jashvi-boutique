const ReturnRequest = require('../models/ReturnRequest');
const Order = require('../models/Order');
const AdminAuditLog = require('../models/AdminAuditLog');

function generateReturnNumber() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RET-${new Date().getFullYear()}-${randomStr}`;
}

/**
 * Customer: Submit return request for an order
 */
async function createReturnRequest(req, res, next) {
  try {
    const { orderId, items, customerReason, customerComments } = req.body;
    const user = req.user;

    if (!orderId || !items || items.length === 0 || !customerReason) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, return item(s), and reason are required.',
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only return your own orders.' });
    }

    if (order.fulfillmentStatus !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Returns can only be requested for orders that have already been marked as Delivered.',
      });
    }

    const returnNumber = generateReturnNumber();

    const returnReq = await ReturnRequest.create({
      returnNumber,
      order: order._id,
      orderNumber: order.orderNumber,
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      items,
      customerReason,
      customerComments: customerComments || '',
      status: 'Requested',
      statusHistory: [
        {
          status: 'Requested',
          note: `Customer submitted return request. Reason: ${customerReason}`,
          updatedBy: user.name,
        },
      ],
    });

    // Mark order status
    order.fulfillmentStatus = 'Return Requested';
    order.timeline.push({
      status: 'Return Requested',
      note: `Customer submitted return request #${returnNumber}.`,
      updatedBy: user.name,
    });
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Return request submitted successfully. Our boutique team will review your request.',
      returnRequest: returnReq,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Customer: Get my return requests
 */
async function getMyReturns(req, res, next) {
  try {
    const returns = await ReturnRequest.find({ 'user.userId': req.user._id })
      .populate('order')
      .sort({ createdAt: -1 });

    res.json({ success: true, returns });
  } catch (err) {
    next(err);
  }
}

/**
 * Public/Customer: Track return by return number
 */
async function trackReturn(req, res, next) {
  try {
    const { returnNumber } = req.params;
    const returnReq = await ReturnRequest.findOne({ returnNumber: returnNumber.trim() });

    if (!returnReq) {
      return res.status(404).json({ success: false, message: 'Return request not found.' });
    }

    res.json({ success: true, returnRequest: returnReq });
  } catch (err) {
    next(err);
  }
}

// ------------------------------------------------------------------------
// ADMIN RETURN & REFUND WORKFLOW
// ------------------------------------------------------------------------

/**
 * Admin: Get all return requests
 */
async function getAllReturns(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};

    const skip = (Number(page) - 1) * Number(limit);
    const total = await ReturnRequest.countDocuments(filter);
    const returns = await ReturnRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      returns,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Update return request status (Approve, Reject, Inspect)
 */
async function updateReturnStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const returnReq = await ReturnRequest.findById(id);
    if (!returnReq) {
      return res.status(404).json({ success: false, message: 'Return request not found' });
    }

    const previousStatus = returnReq.status;
    returnReq.status = status;
    returnReq.adminNotes = adminNotes || returnReq.adminNotes;
    returnReq.reviewedBy = req.user.name;
    returnReq.reviewedAt = new Date();

    returnReq.statusHistory.push({
      status,
      note: adminNotes || `Return status updated to ${status}.`,
      updatedBy: req.user.name,
    });

    await returnReq.save();

    await AdminAuditLog.create({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: 'RETURN_STATUS_UPDATED',
      entityType: 'ReturnRequest',
      entityId: returnReq._id.toString(),
      details: `Return ${returnReq.returnNumber} updated from "${previousStatus}" to "${status}". Notes: ${adminNotes}`,
      previousState: { status: previousStatus },
      newState: { status },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Return request status updated to "${status}".`,
      returnRequest: returnReq,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Record manual refund for return or cancellation
 */
async function recordRefund(req, res, next) {
  try {
    const { id } = req.params;
    const { amount, method, transactionReference, notes } = req.body;

    if (!amount || Number(amount) <= 0 || !method) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount and method are required.',
      });
    }

    const returnReq = await ReturnRequest.findById(id);
    if (!returnReq) {
      return res.status(404).json({ success: false, message: 'Return request not found' });
    }

    returnReq.status = 'Refunded';
    returnReq.refundDetails = {
      amount: Number(amount),
      method,
      transactionReference: transactionReference || 'MANUAL-REFUND',
      processedAt: new Date(),
      processedBy: req.user.name,
      notes: notes || '',
    };

    returnReq.statusHistory.push({
      status: 'Refunded',
      note: `Manual refund of ₹${amount} recorded via ${method} (Ref: ${
        transactionReference || 'N/A'
      }) by ${req.user.name}.`,
      updatedBy: req.user.name,
    });

    await returnReq.save();

    // Update order payment status
    await Order.findByIdAndUpdate(returnReq.order, {
      'payment.status': 'REFUNDED',
      fulfillmentStatus: 'Returned',
    });

    await AdminAuditLog.create({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: 'REFUND_RECORDED',
      entityType: 'Refund',
      entityId: returnReq._id.toString(),
      details: `Manual refund of ₹${amount} recorded via ${method} for return #${returnReq.returnNumber}.`,
      newState: returnReq.refundDetails,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Refund recorded and return completed.',
      returnRequest: returnReq,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createReturnRequest,
  getMyReturns,
  trackReturn,
  getAllReturns,
  updateReturnStatus,
  recordRefund,
};
