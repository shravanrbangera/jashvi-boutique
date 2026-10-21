# Jashvi Boutique — Setup & Operational Guide

This document describes how to set up, configure, run, and maintain the **Jashvi Boutique** full-stack e-commerce application.

---

## 1. Project Architecture

The application is structured into two main packages:
- **`server/`**: Node.js & Express.js REST API with Mongoose ODM, JWT authentication, rate limiting, atomic stock deductions, and service adapters for Payments and Image Storage.
- **`client/`**: React 18 single-page application built with Vite, React Router 6, Lucide icons, and Vanilla CSS with design tokens.

---

## 2. Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB community server (v6.0+) running on `mongodb://127.0.0.1:27017` OR a MongoDB Atlas cluster URI.

---

## 3. Environment Variables Configuration

### Security Rules
1. **Never commit `.env` to Git**. All `.env` and `.env.*` files are excluded in root `.gitignore`.
2. All backend secrets are read strictly via `process.env` in `server/src/config/env.js`.
3. Never expose database URIs, JWT secrets, Razorpay secrets, or Cloudinary API secrets to the client/browser.

### Setting up the Server Environment
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Copy the template file `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and configure your settings:
   ```env
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:5173

   # MongoDB connection string
   MONGODB_URI=mongodb://127.0.0.1:27017/jashvi_boutique

   # Security secrets (generate long random strings in production)
   JWT_SECRET=your_super_secret_jwt_key_min_32_characters_here
   JWT_EXPIRES_IN=7d
   COOKIE_SECRET=your_cookie_signing_secret_here

   # Initial Seed Credentials
   ADMIN_NAME=Jashvi Boutique Admin
   ADMIN_EMAIL=admin@jashviboutique.com
   ADMIN_PASSWORD=JashviAdmin@2026!
   ADMIN_PHONE=8050853393

   # Image Storage Adapter: 'local' (development) or 'cloudinary' (production)
   STORAGE_MODE=local
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Payment Gateway: 'mock' (development sandbox) or 'razorpay' (live)
   PAYMENT_MODE=mock
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
   ```

---

## 4. Database Seeding & Initial Credentials

Initialize the database with default boutique categories, clothing catalog items, delivery zones, promo coupons, and the administrator account:

```bash
cd server
npm run seed
```

### Pre-Configured Seed Accounts:
- **Authorized Administrator Portal**:
  - URL: `http://localhost:5173/admin/login`
  - Email: `admin@jashviboutique.com`
  - Password: `JashviAdmin@2026!`
- **Demonstration Customer Account**:
  - URL: `http://localhost:5173/login`
  - Email: `customer@example.com`
  - Password: `CustomerPass@2026`

---

## 5. Starting the Application

### 5.1 Start Backend Server
```bash
cd server
npm run dev
# Server starts at http://localhost:5000
```

### 5.2 Start Frontend Client
```bash
cd client
npm run dev
# Vite dev server starts at http://localhost:5173
```

---

## 6. How Optional Integrations Work

Both payments and image storage are built behind abstract service interfaces so third-party credentials can be plugged in without refactoring order workflows or product management.

### 6.1 Payment Gateway (`paymentService.js`)
- **Development Mode (`PAYMENT_MODE=mock`)**:
  - Active by default when Razorpay keys are omitted or set to placeholders.
  - Automatically tags all mock transactions with `[DEV MOCK PAYMENT]` notice and returns `isMock: true`.
  - The client displays the `DevMockPaymentModal`, allowing developers and testers to simulate both **Verified Payment Success** and **Simulated Failure**.
  - **Mock payments are never treated as real money.**
- **Production Mode (`PAYMENT_MODE=razorpay`)**:
  - Set `PAYMENT_MODE=razorpay` in `server/.env`.
  - Add your merchant `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
  - The backend creates authentic Razorpay Orders via the Razorpay SDK and verifies webhook and callback signatures using HMAC-SHA256 (`crypto.createHmac('sha256')`).

### 6.2 Image Storage Adapter (`storageService.js`)
- **Development Mode (`STORAGE_MODE=local`)**:
  - Stores uploaded product and atelier photos safely in `server/uploads/`.
  - Files are served via Express static middleware on `/uploads/*`.
- **Production Mode (`STORAGE_MODE=cloudinary`)**:
  - Set `STORAGE_MODE=cloudinary` in `server/.env`.
  - Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
  - Automatically uploads image buffers securely via stream to Cloudinary folder `jashvi_boutique/products`.

---

## 7. Running Automated Tests

Run the automated integration test suite covering 25 test cases:
```bash
cd server
npm test
```
The test runner validates:
1. Customer registration, login, and JWT issuance
2. PIN code serviceability checking
3. Atomic stock decrements on purchase
4. Mock payment execution and idempotency
5. Invoice snapshot calculation and tamper prevention
6. Admin invoice price adjustments with mandatory audit trail
7. Verified order tracking requiring matching phone number
8. Customer return submissions and administrative manual refund records
9. Admin dashboard metric aggregation
