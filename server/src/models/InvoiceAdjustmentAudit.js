const mongoose = require('mongoose');

const invoiceAdjustmentAuditSchema = new mongoose.Schema(
  {
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    adminEmail: {
      type: String,
      required: true,
    },
    fieldAdjusted: {
      type: String,
      required: true,
      enum: ['deliveryCharge', 'discount', 'tax', 'finalTotal', 'notes'],
    },
    previousValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    amountChanged: {
      type: Number,
      default: 0,
    },
    reason: {
      type: String,
      required: [true, 'A detailed reason is mandatory for any invoice adjustment'],
      trim: true,
      minlength: [5, 'Reason must be at least 5 characters'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('InvoiceAdjustmentAudit', invoiceAdjustmentAuditSchema);
