const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    adminEmail: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ['Product', 'Inventory', 'Order', 'Invoice', 'DeliveryZone', 'ReturnRequest', 'Refund', 'Coupon', 'Settings'],
    },
    entityId: {
      type: String,
      default: null,
    },
    details: {
      type: String,
      default: '',
    },
    previousState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);
