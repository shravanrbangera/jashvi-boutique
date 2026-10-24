const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { config, logEnvironmentSummary } = require('./config/env');
const { connectDB } = require('./config/db');
const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const returnRoutes = require('./routes/returnRoutes');
const couponRoutes = require('./routes/couponRoutes');
const adminRoutes = require('./routes/adminRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Security Headers with Cross-Origin Resource Policy for uploaded assets
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS Configuration
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local dev testing
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-guest-id'],
  })
);

// Body parsers & Cookie parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.cookieSecret));

// Serve local upload assets statically
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Serve production frontend build static assets
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// Health check endpoint (exempt from rate limits and db wait for instant cloud ping)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Jashvi Boutique REST API',
    mode: config.env,
    storageAdapter: config.storage.mode,
    paymentAdapter: config.payment.mode,
    isMockPayments: !config.payment.isRazorpayActive,
  });
});

// Database connection assurance for serverless environments
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[Database Middleware Error]:', err.message);
    return res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// General API Rate Limiting
app.use('/api', generalLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// Client Single Page Application fallback for production Render deployment
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexHtml = path.join(clientDistPath, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) {
      next();
    }
  });
});

// 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Server startup
async function startServer() {
  try {
    await connectDB();
    logEnvironmentSummary();

    const server = app.listen(config.port, '0.0.0.0', async () => {
      console.log(`[Jashvi Boutique Server] Running smoothly on port ${config.port} (0.0.0.0)`);

      // Auto-seed initial catalog if database is fresh (e.g. initial Render deployment)
      try {
        const Category = require('./models/Category');
        const catCount = await Category.countDocuments();
        if (catCount === 0) {
          console.log('[Render Auto-Setup] Fresh database detected. Seeding initial boutique catalog & admin...');
          const { seedDatabase } = require('./scripts/seed');
          await seedDatabase();
        }
      } catch (seedErr) {
        console.warn('[Auto-Seed Note]:', seedErr.message);
      }
    });

    return server;
  } catch (error) {
    console.error('[Startup Failure] Failed to start server:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

app.app = app;
app.startServer = startServer;
module.exports = app;
