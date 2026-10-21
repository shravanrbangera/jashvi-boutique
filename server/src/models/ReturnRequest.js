const mongoose = require('mongoose');

const returnItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    sku: String,
    name: String,
    size: String,
    color: String,
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: Number,
    reason: {
      type: String,
      required: true,
    },
  },
  { _id: true }
);

const returnRequestSchema = new mongoose.Schema(
  {
    returnNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    user: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    items: [returnItemSchema],
    customerReason: {
      type: String,
      required: [true, 'Return reason is required'],
      trim: true,
    },
    customerComments: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'Requested',
        'Under Review',
        'Approved',
        'Rejected',
        'Awaiting Returned Item',
        'Item Received',
        'Refund Processing',
        'Refunded',
        'Refund Failed',
      ],
      default: 'Requested',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    refundDetails: {
      amount: { type: Number, default: 0 },
      method: {
        type: String,
        enum: ['ORIGINAL_GATEWAY', 'UPI', 'BANK_TRANSFER', 'STORE_CREDIT', 'CASH', 'NONE'],
        default: 'NONE',
      },
      transactionReference: { type: String, default: null },
      processedAt: { type: Date, default: null },
      processedBy: { type: String, default: null },
      notes: { type: String, default: '' },
    },
    statusHistory: [
      {
        status: String,
        note: String,
        updatedBy: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
