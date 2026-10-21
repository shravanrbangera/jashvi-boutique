const mongoose = require('mongoose');

const orderItemSnapshotSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    image: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const orderAddressSnapshotSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    landmark: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

const timelineEventSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    updatedBy: { type: String, default: 'System' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    trackingToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    items: [orderItemSnapshotSchema],
    deliveryAddress: orderAddressSnapshotSchema,
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      couponCode: { type: String, default: null },
      deliveryCharge: { type: Number, required: true, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      finalTotal: { type: Number, required: true, min: 0 },
    },
    payment: {
      method: {
        type: String,
        enum: ['COD', 'ONLINE'],
        required: true,
      },
      status: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
        default: 'PENDING',
      },
      provider: {
        type: String,
        default: 'NONE',
      },
      gatewayOrderId: { type: String, default: null },
      transactionId: { type: String, default: null },
      isMock: { type: Boolean, default: false },
      paidAt: { type: Date, default: null },
      collectedByAdmin: { type: String, default: null },
      reconciliationNotes: { type: String, default: '' },
    },
    fulfillmentStatus: {
      type: String,
      enum: [
        'Placed',
        'Confirmed',
        'Processing',
        'Packed',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Return Requested',
        'Returned',
      ],
      default: 'Placed',
    },
    trackingDetails: {
      courierPartner: { type: String, default: 'Local Boutique Delivery' },
      trackingNumber: { type: String, default: null },
      estimatedDelivery: { type: String, default: null },
    },
    inventoryDeducted: {
      type: Boolean,
      default: false,
    },
    timeline: [timelineEventSchema],
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ 'user.userId': 1 });
orderSchema.index({ fulfillmentStatus: 1 });
orderSchema.index({ 'payment.status': 1 });

module.exports = mongoose.model('Order', orderSchema);
