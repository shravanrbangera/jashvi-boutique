const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
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
      unique: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    boutiqueInfo: {
      name: { type: String, default: 'Jashvi Boutique' },
      address: {
        type: String,
        default:
          '#G1, Ground Floor, Bloom Residency, Victor Bishop Road, Attavara, Mangalore, Karnataka 575001',
      },
      phone: { type: String, default: '8050853393' },
      email: { type: String, default: 'contact@jashviboutique.com' },
      gstin: { type: String, default: 'Pending Boutique Verification' },
    },
    customerInfo: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    deliveryAddress: {
      fullName: String,
      phone: String,
      addressLine: String,
      landmark: String,
      city: String,
      state: String,
      pincode: String,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        sku: String,
        size: String,
        color: String,
        quantity: Number,
        unitPrice: Number,
        lineTotal: Number,
      },
    ],
    pricing: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      couponCode: { type: String, default: null },
      deliveryCharge: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      finalTotal: { type: Number, required: true },
    },
    paymentInfo: {
      method: String,
      status: String,
      transactionId: String,
      paidAt: Date,
    },
    adjustmentSummary: {
      hasBeenAdjusted: { type: Boolean, default: false },
      lastAdjustedAt: Date,
      lastAdjustedBy: String,
      adjustmentCount: { type: Number, default: 0 },
    },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
