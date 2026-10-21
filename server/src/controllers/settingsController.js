const StoreSettings = require('../models/StoreSettings');
const AdminAuditLog = require('../models/AdminAuditLog');

/**
 * Public: Get boutique store settings & announcements
 */
async function getSettings(req, res, next) {
  try {
    const settings = await StoreSettings.getSettings();
    res.json({
      success: true,
      settings,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Update boutique store settings
 */
async function updateSettings(req, res, next) {
  try {
    const settings = await StoreSettings.getSettings();
    const previous = settings.toObject();

    const allowed = [
      'boutiqueName',
      'tagline',
      'phone',
      'email',
      'address',
      'storeHours',
      'announcementBar',
      'returnPolicy',
      'freeShippingThreshold',
      'allowCOD',
      'maxCODAmount',
    ];

    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        settings[key] = req.body[key];
      }
    });

    await settings.save();

    await AdminAuditLog.create({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: 'STORE_SETTINGS_UPDATED',
      entityType: 'Settings',
      entityId: settings._id.toString(),
      details: 'Boutique store settings updated.',
      previousState: previous,
      newState: settings.toObject(),
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Store settings updated successfully.',
      settings,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSettings,
  updateSettings,
};
