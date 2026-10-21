const DeliveryZone = require('../models/DeliveryZone');
const AdminAuditLog = require('../models/AdminAuditLog');

/**
 * Public: Check serviceability of a PIN code
 */
async function checkPincode(req, res, next) {
  try {
    const { pincode } = req.body;
    if (!pincode || !/^[1-9][0-9]{5}$/.test(String(pincode).trim())) {
      return res.status(400).json({
        success: false,
        serviceable: false,
        message: 'Please enter a valid 6-digit Indian PIN code.',
      });
    }

    const result = await DeliveryZone.checkServiceability(pincode);
    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Get all delivery zones / PIN codes
 */
async function getAllDeliveryZones(req, res, next) {
  try {
    const zones = await DeliveryZone.find().sort({ state: 1, city: 1, pincode: 1 });
    res.json({
      success: true,
      count: zones.length,
      zones,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Create delivery zone
 */
async function createDeliveryZone(req, res, next) {
  try {
    const { pincode, zoneName, city, state, deliveryCharge, estimatedDays, isServiceable, isApproved, isActive } =
      req.body;

    if (!pincode || !city || !state || deliveryCharge === undefined) {
      return res.status(400).json({
        success: false,
        message: 'PIN code, City, State, and Delivery Charge are required.',
      });
    }

    const existing = await DeliveryZone.findOne({ pincode: String(pincode).trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Delivery configuration for PIN code ${pincode} already exists.`,
      });
    }

    const zone = await DeliveryZone.create({
      pincode: String(pincode).trim(),
      zoneName: zoneName || `${city} Zone`,
      city,
      state,
      deliveryCharge: Number(deliveryCharge),
      estimatedDays: estimatedDays || '2 - 4 business days',
      isServiceable: isServiceable !== undefined ? Boolean(isServiceable) : true,
      isApproved: isApproved !== undefined ? Boolean(isApproved) : true,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await AdminAuditLog.create({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: 'DELIVERY_ZONE_CREATED',
      entityType: 'DeliveryZone',
      entityId: zone._id.toString(),
      details: `Created delivery zone for PIN ${zone.pincode} (${zone.city}) with charge ₹${zone.deliveryCharge}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Delivery zone created successfully.',
      zone,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Update delivery zone
 */
async function updateDeliveryZone(req, res, next) {
  try {
    const { id } = req.params;
    const zone = await DeliveryZone.findById(id);

    if (!zone) {
      return res.status(404).json({ success: false, message: 'Delivery zone not found' });
    }

    const previousState = {
      deliveryCharge: zone.deliveryCharge,
      isServiceable: zone.isServiceable,
      isActive: zone.isActive,
      isApproved: zone.isApproved,
    };

    const updatable = [
      'zoneName',
      'city',
      'state',
      'deliveryCharge',
      'estimatedDays',
      'isServiceable',
      'isApproved',
      'isActive',
      'notes',
    ];

    updatable.forEach((f) => {
      if (req.body[f] !== undefined) zone[f] = req.body[f];
    });

    await zone.save();

    await AdminAuditLog.create({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: 'DELIVERY_ZONE_UPDATED',
      entityType: 'DeliveryZone',
      entityId: zone._id.toString(),
      details: `Updated delivery zone PIN ${zone.pincode}`,
      previousState,
      newState: {
        deliveryCharge: zone.deliveryCharge,
        isServiceable: zone.isServiceable,
        isActive: zone.isActive,
        isApproved: zone.isApproved,
      },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Delivery zone updated.',
      zone,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  checkPincode,
  getAllDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
};
