const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema(
  {
    boutiqueName: {
      type: String,
      default: 'Jashvi Boutique',
    },
    tagline: {
      type: String,
      default: "Mangalore's Premier Ladies' Ethnic & Bespoke Fashion Atelier",
    },
    phone: {
      type: String,
      default: '8050853393',
    },
    email: {
      type: String,
      default: 'contact@jashviboutique.com',
    },
    address: {
      type: String,
      default:
        '#G1, Ground Floor, Bloom Residency, Victor Bishop Road, Attavara, Mangalore, Karnataka 575001',
    },
    storeHours: {
      type: String,
      default: '10:00 AM to 8:30 PM (Sunday Closed)',
    },
    announcementBar: {
      text: {
        type: String,
        default: 'Complimentary Boutique Delivery in Mangalore for orders above ₹1,999 | In-Store Custom Tailoring Available',
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
    returnPolicy: {
      windowDays: {
        type: Number,
        default: 7,
      },
      policyText: {
        type: String,
        default:
          'Eligible unworn ready-made clothing with original tags may be returned within 7 days of delivery. Tailored or customized items and unstitched fabrics cut to order are non-returnable. Refunds are processed upon inspection.',
      },
      isConfigured: {
        type: Boolean,
        default: true,
      },
    },
    freeShippingThreshold: {
      type: Number,
      default: 1999,
    },
    allowCOD: {
      type: Boolean,
      default: true,
    },
    maxCODAmount: {
      type: Number,
      default: 15000,
    },
  },
  {
    timestamps: true,
  }
);

// Singleton helper to get or create store settings
storeSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
