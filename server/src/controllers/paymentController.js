const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const AdminAuditLog = require('../models/AdminAuditLog');
const { paymentService } = require('../services/payment/paymentService');

/**
 * Verify online payment on backend
 */
async function verifyOnlinePayment(req, res, next) {
  try {
    const { orderId, paymentId, signature } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Call modular payment service
    const verification = await paymentService.verifyPayment({
      orderId: order.payment.gatewayOrderId || order._id.toString(),
      paymentId,
      signature,
    });

    if (!verification.isValid) {
      order.payment.status = 'FAILED';
      order.timeline.push({
        status: 'Payment Failed',
        note: `Online payment verification failed: ${verification.error || 'Invalid signature'}.`,
        updatedBy: 'Payment Gateway',
      });
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Please check with your bank or try again.',
        error: verification.error,
      });
    }

    // Success
    order.payment.status = 'PAID';
    order.payment.transactionId = verification.transactionId;
    order.payment.paidAt = new Date();
    order.payment.isMock = verification.isMock;
    // Order fulfillment remains 'Placed' until reviewed and confirmed by boutique admin

    order.timeline.push({
      status: 'Payment Received',
      note: `Online payment verified (${verification.provider} Txn: ${verification.transactionId}). Awaiting admin order confirmation.`,
      updatedBy: 'Payment Gateway',
    });

    await order.save();

    // Update invoice snapshot
    await Invoice.findOneAndUpdate(
      { order: order._id },
      {
        'paymentInfo.status': 'PAID',
        'paymentInfo.transactionId': verification.transactionId,
        'paymentInfo.paidAt': new Date(),
      }
    );

    res.json({
      success: true,
      message: 'Payment verified successfully! Your order is confirmed.',
      isMock: verification.isMock,
      notice: verification.isMock ? '[DEV MOCK PAYMENT] Transaction verified via sandbox adapter.' : null,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.payment.status,
        fulfillmentStatus: order.fulfillmentStatus,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Record COD Collection and Reconciliation
 */
async function recordCODCollection(req, res, next) {
  try {
    const { orderId } = req.params;
    const { amountCollected, collectedBy, notes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.payment.method !== 'COD') {
      return res.status(400).json({
        success: false,
        message: 'This order is not a Cash on Delivery order.',
      });
    }

    const previousStatus = order.payment.status;
    order.payment.status = 'PAID';
    order.payment.paidAt = new Date();
    order.payment.collectedByAdmin = collectedBy || req.user.name;
    order.payment.reconciliationNotes = notes || 'Cash collected and reconciled upon delivery.';

    order.timeline.push({
      status: 'Payment Collected',
      note: `Cash on Delivery (₹${amountCollected || order.pricing.finalTotal}) collected by ${
        collectedBy || req.user.name
      }.`,
      updatedBy: req.user.name,
    });

    await order.save();

    // Update invoice
    await Invoice.findOneAndUpdate(
      { order: order._id },
      {
        'paymentInfo.status': 'PAID',
        'paymentInfo.paidAt': new Date(),
      }
    );

    await AdminAuditLog.create({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: 'COD_PAYMENT_COLLECTED',
      entityType: 'Order',
      entityId: order._id.toString(),
      details: `COD payment of ₹${order.pricing.finalTotal} collected and marked as PAID for order ${order.orderNumber}.`,
      previousState: { paymentStatus: previousStatus },
      newState: { paymentStatus: 'PAID', collectedBy: order.payment.collectedByAdmin },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'COD payment successfully reconciled and marked as PAID.',
      order,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  verifyOnlinePayment,
  recordCODCollection,
};
