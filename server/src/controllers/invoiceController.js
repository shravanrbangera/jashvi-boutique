const Invoice = require('../models/Invoice');
const InvoiceAdjustmentAudit = require('../models/InvoiceAdjustmentAudit');
const Order = require('../models/Order');
const AdminAuditLog = require('../models/AdminAuditLog');

/**
 * Get single invoice by orderId or invoiceNumber
 */
async function getInvoice(req, res, next) {
  try {
    const { identifier } = req.params;

    let invoice = await Invoice.findOne({
      $or: [{ orderNumber: identifier }, { invoiceNumber: identifier }],
    }).lean();

    if (!invoice && identifier.match(/^[0-9a-fA-F]{24}$/)) {
      invoice = await Invoice.findOne({ order: identifier }).lean();
    }

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    // Access authorization check: Customer can only view their own invoice
    const isAdmin = req.user.role === 'admin';
    const isOwner = invoice.customerInfo.userId && invoice.customerInfo.userId.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized access to invoice.' });
    }

    // Include adjustment history if admin
    let adjustments = [];
    if (isAdmin) {
      adjustments = await InvoiceAdjustmentAudit.find({ invoice: invoice._id }).sort({ timestamp: -1 });
    }

    res.json({
      success: true,
      invoice,
      adjustments,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Controlled Invoice Adjustment with mandatory reason and immutable audit history
 */
async function adjustInvoice(req, res, next) {
  try {
    const { id } = req.params;
    const { field, newValue, reason } = req.body;

    if (!field || newValue === undefined || !reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Field, newValue, and a detailed reason (minimum 5 characters) are mandatory for invoice adjustment.',
      });
    }

    const allowedFields = ['deliveryCharge', 'discount', 'tax'];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        message: `Field "${field}" cannot be adjusted directly. Allowed: ${allowedFields.join(', ')}`,
      });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const previousValue = invoice.pricing[field] || 0;
    const numNewVal = Math.max(0, Number(newValue));
    invoice.pricing[field] = numNewVal;

    // Recalculate finalTotal
    const previousTotal = invoice.pricing.finalTotal;
    const newTotal = Math.max(
      0,
      invoice.pricing.subtotal - invoice.pricing.discount + invoice.pricing.deliveryCharge + invoice.pricing.tax
    );
    invoice.pricing.finalTotal = newTotal;

    invoice.adjustmentSummary.hasBeenAdjusted = true;
    invoice.adjustmentSummary.lastAdjustedAt = new Date();
    invoice.adjustmentSummary.lastAdjustedBy = req.user.email;
    invoice.adjustmentSummary.adjustmentCount = (invoice.adjustmentSummary.adjustmentCount || 0) + 1;

    await invoice.save();

    // Create immutable audit record
    const audit = await InvoiceAdjustmentAudit.create({
      invoice: invoice._id,
      order: invoice.order,
      adminId: req.user._id,
      adminEmail: req.user.email,
      fieldAdjusted: field,
      previousValue,
      newValue: numNewVal,
      amountChanged: newTotal - previousTotal,
      reason: reason.trim(),
    });

    // Also update order pricing snapshot
    await Order.findByIdAndUpdate(invoice.order, {
      'pricing.deliveryCharge': invoice.pricing.deliveryCharge,
      'pricing.discount': invoice.pricing.discount,
      'pricing.tax': invoice.pricing.tax,
      'pricing.finalTotal': newTotal,
    });

    res.json({
      success: true,
      message: 'Invoice adjusted successfully and audit record created.',
      invoice,
      audit,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Get complete adjustment history for an invoice
 */
async function getAdjustmentHistory(req, res, next) {
  try {
    const { id } = req.params;
    const audits = await InvoiceAdjustmentAudit.find({ invoice: id }).sort({ timestamp: -1 });
    res.json({ success: true, count: audits.length, audits });
  } catch (err) {
    next(err);
  }
}

async function listInvoices(req, res, next) {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } },
      ];
    }
    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      invoices,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Approve and finalize a provisional invoice
 */
async function approveInvoice(req, res, next) {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    invoice.approvalStatus = 'APPROVED';
    invoice.approvedAt = new Date();
    invoice.approvedBy = req.user.email;
    await invoice.save();

    // Also update order if still placed
    const order = await Order.findById(invoice.order);
    if (order && order.fulfillmentStatus === 'Placed') {
      order.fulfillmentStatus = 'Confirmed';
      order.timeline.push({
        status: 'Confirmed',
        note: `Bill approved and finalized by admin (${req.user.email}).`,
        updatedBy: req.user.name || req.user.email,
        timestamp: new Date(),
      });
      await order.save();
    }

    // Record audit log
    await AdminAuditLog.create({
      action: 'INVOICE_APPROVED',
      entityType: 'Invoice',
      entityId: invoice._id.toString(),
      adminId: req.user._id,
      adminEmail: req.user.email,
      details: `Invoice ${invoice.invoiceNumber} (Order ${invoice.orderNumber}) approved and finalized.`,
      after: { approvalStatus: 'APPROVED', approvedBy: req.user.email },
    });

    res.json({
      success: true,
      message: 'Invoice successfully approved and marked as Final Verified Bill.',
      invoice,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getInvoice,
  listInvoices,
  adjustInvoice,
  getAdjustmentHistory,
  approveInvoice,
};
