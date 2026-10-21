const path = require('path');
const dotenv = require('dotenv');

// Load .env explicitly from the server directory
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Validate essential required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('FATAL CONFIGURATION ERROR: Missing required environment variables:');
  missingVars.forEach((v) => console.error(` - ${v}`));
  console.error('Please configure them in server/.env according to server/.env.example');
  process.exit(1);
}

// Payment configuration evaluation
const hasRazorpayKeys =
  Boolean(process.env.RAZORPAY_KEY_ID) &&
  Boolean(process.env.RAZORPAY_KEY_SECRET) &&
  !process.env.RAZORPAY_KEY_ID.includes('your_') &&
  !process.env.RAZORPAY_KEY_SECRET.includes('your_');

const paymentMode = hasRazorpayKeys ? 'razorpay' : 'mock';

// Cloudinary configuration evaluation
const hasCloudinaryKeys =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET) &&
  !process.env.CLOUDINARY_CLOUD_NAME.includes('your_');

const storageMode = hasCloudinaryKeys ? 'cloudinary' : 'local';

const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cookieSecret: process.env.COOKIE_SECRET || 'jashvi_cookie_secret_fallback',
  adminSeed: {
    name: process.env.ADMIN_NAME || 'Jashvi Boutique Admin',
    email: process.env.ADMIN_EMAIL || 'admin@jashviboutique.com',
    password: process.env.ADMIN_PASSWORD || 'JashviAdmin@2026!',
    phone: process.env.ADMIN_PHONE || '8050853393',
  },
  storage: {
    mode: storageMode,
    isCloudinaryActive: hasCloudinaryKeys,
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
      apiKey: process.env.CLOUDINARY_API_KEY || null,
      apiSecret: process.env.CLOUDINARY_API_SECRET || null,
    },
    localUploadDir: path.resolve(__dirname, '../../uploads'),
  },
  payment: {
    mode: paymentMode,
    isRazorpayActive: hasRazorpayKeys,
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID || null,
      keySecret: process.env.RAZORPAY_KEY_SECRET || null,
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || null,
    },
  },
  boutique: {
    name: process.env.BOUTIQUE_NAME || 'Jashvi Boutique',
    phone: process.env.BOUTIQUE_PHONE || '8050853393',
    email: process.env.BOUTIQUE_EMAIL || 'contact@jashviboutique.com',
    address:
      process.env.BOUTIQUE_ADDRESS ||
      '#G1, Ground Floor, Bloom Residency, Victor Bishop Road, Attavara, Mangalore, Karnataka 575001',
    timings: '10:00 AM - 8:30 PM (Sunday Closed)',
  },
};

/**
 * Log startup summary without leaking any credentials or secrets
 */
function logEnvironmentSummary() {
  console.log('----------------------------------------------------');
  console.log('  JASHVI BOUTIQUE SERVER - CONFIGURATION SUMMARY    ');
  console.log('----------------------------------------------------');
  console.log(`- Environment:     ${config.env}`);
  console.log(`- Port:            ${config.port}`);
  console.log(`- Client Origin:   ${config.clientUrl}`);
  console.log(`- Database:        MongoDB Connected (${config.mongoUri.replace(/:([^:@]+)@/, ':****@')})`);
  console.log(
    `- Image Storage:   ${
      config.storage.isCloudinaryActive
        ? 'Cloudinary (Cloud Active)'
        : 'Local Disk Storage Adapter (Development Safe)'
    }`
  );
  console.log(
    `- Payment Gateway: ${
      config.payment.isRazorpayActive
        ? 'Razorpay Gateway (Production/Sandbox Active)'
        : '[EXPLICIT DEVELOPMENT MOCK GATEWAY] (Not real money, sandbox dev only)'
    }`
  );
  console.log('----------------------------------------------------');
}

module.exports = {
  config,
  logEnvironmentSummary,
};
