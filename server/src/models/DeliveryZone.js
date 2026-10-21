const mongoose = require('mongoose');

const deliveryZoneSchema = new mongoose.Schema(
  {
    pincode: {
      type: String,
      required: [true, 'PIN code is required'],
      unique: true,
      trim: true,
      match: [/^[1-9][0-9]{5}$/, 'PIN code must be a valid 6-digit Indian Postal code'],
    },
    zoneName: {
      type: String,
      required: true,
      trim: true,
      default: 'Local Delivery Zone',
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryCharge: {
      type: Number,
      required: true,
      min: [0, 'Delivery charge cannot be negative'],
      default: 0,
    },
    estimatedDays: {
      type: String,
      default: '2 - 4 business days',
    },
    isServiceable: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify if serviceable for customer checkout
deliveryZoneSchema.statics.checkServiceability = async function (pincode) {
  const zone = await this.findOne({
    pincode: String(pincode).trim(),
    isActive: true,
    isApproved: true,
  });

  if (!zone) {
    return {
      serviceable: false,
      message: `Delivery is currently not serviceable to PIN code ${pincode}. Please contact boutique for local pickup.`,
    };
  }

  if (!zone.isServiceable) {
    return {
      serviceable: false,
      message: `PIN code ${pincode} (${zone.city}) is temporarily unserviceable.`,
    };
  }

  return {
    serviceable: true,
    zone,
    deliveryCharge: zone.deliveryCharge,
    estimatedDays: zone.estimatedDays,
    city: zone.city,
    state: zone.state,
  };
};

module.exports = mongoose.model('DeliveryZone', deliveryZoneSchema);
