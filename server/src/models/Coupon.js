const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: true,
      min: [0, 'Discount value must be positive'],
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
    },
    validUntil: {
      type: Date,
      default: null,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.methods.calculateDiscount = function (orderSubtotal) {
  if (!this.isActive) return { valid: false, error: 'Coupon is inactive' };
  if (this.validUntil && new Date() > this.validUntil) return { valid: false, error: 'Coupon has expired' };
  if (this.usageLimit && this.usedCount >= this.usageLimit) return { valid: false, error: 'Coupon limit reached' };
  if (orderSubtotal < this.minOrderValue) {
    return {
      valid: false,
      error: `Minimum order subtotal of ₹${this.minOrderValue} required for this coupon`,
    };
  }

  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = Math.round((orderSubtotal * this.discountValue) / 100);
    if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
      discount = this.maxDiscountAmount;
    }
  } else {
    discount = Math.min(this.discountValue, orderSubtotal);
  }

  return { valid: true, discount, code: this.code };
};

module.exports = mongoose.model('Coupon', couponSchema);
