const Coupon = require('../models/Coupon');
const AdminAuditLog = require('../models/AdminAuditLog');

/**
 * Validate and apply coupon against subtotal
 */
async function applyCoupon(req, res, next) {
  try {
    const { code, subtotal } = req.body;
    if (!code || !subtotal) {
      return res.status(400).json({ success: false, message: 'Coupon code and subtotal required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
    }

    const result = coupon.calculateDiscount(Number(subtotal));
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully!`,
      coupon: {
        code: coupon.code,
        discount: result.discount,
        description: coupon.description,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Get all coupons
 */
async function getAllCoupons(req, res, next) {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, count: coupons.length, coupons });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Create coupon
 */
async function createCoupon(req, res, next) {
  try {
    const { code, description, discountType, discountValue, minOrderValue, maxDiscountAmount, validUntil, usageLimit } =
      req.body;

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      description,
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
    });

    await AdminAuditLog.create({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: 'COUPON_CREATED',
      entityType: 'Coupon',
      entityId: coupon._id.toString(),
      details: `Created coupon ${coupon.code}`,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, coupon });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Update coupon
 */
async function updateCoupon(req, res, next) {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, coupon });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Delete coupon
 */
async function deleteCoupon(req, res, next) {
  try {
    const { id } = req.params;
    await Coupon.findByIdAndDelete(id);
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  applyCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
