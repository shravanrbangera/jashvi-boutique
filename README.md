# Jashvi Boutique — E-Commerce Website & Admin Portal

A complete, production-oriented, full-stack e-commerce platform built for **Jashvi Boutique**, a premier ladies' clothing boutique located in Attavara, Mangalore, Karnataka, India.

---

## 🌟 Brand Information

- **Brand Name**: Jashvi Boutique
- **Physical Address**: #G1, Ground Floor, Bloom Residency, Victor Bishop Road, Attavara, Mangalore, Karnataka 575001, India
- **Contact Number**: 8050853393
- **Store Hours**: 10:00 AM to 8:30 PM (Sunday Closed) *(Pending final owner verification prior to publishing promotional guarantees)*
- **Core Offerings**: Handcrafted Indian ethnic wear, ready-made kurtis & lehengas, dress materials, pants, nightwear, and in-store bespoke tailoring & customization.

---

## 🚀 Key Features

### A. Customer Experience
1. **Curated Catalog & Brand Identity**: Authentic Jashvi Boutique gold & rose branding, actual product photography, and neutral placeholders.
2. **Dynamic Search & Filtering**: Filter by boutique category, price range, size, color, and stock availability.
3. **Product Details (PDP)**:
   - High-resolution image gallery.
   - Variant-specific inventory (size & color).
   - Live Delivery PIN Code Checker for Indian Postal Codes (e.g., `575001` Mangalore Urban).
   - Interactive size guide modal.
4. **Shopping Cart & Wishlist**:
   - Revalidated server-side pricing and stock availability.
   - Promotional coupon code validation (`JASHVI10`, `FIRSTBUY`, `MANGALOREFESTIVE`).
5. **Secure Authentication & Guest Browsing**:
   - Browse catalog as guest.
   - Mandatory login before checkout.
   - Secure password hashing with bcrypt, JWT authorization, and profile address management.
6. **Checkout & Indian Payment Integration**:
   - Real-time PIN code validation and delivery charge calculation in Indian Rupees (INR).
   - Support for Cash on Delivery (COD) and Online Payments.
   - Explicit **Development Mock Payment Provider** with interactive modal to simulate verified payments without live credentials.
7. **Order Confirmation & Invoices**:
   - Order tracking with mandatory phone number verification to prevent unauthorized order inspection.
   - Clean, printable Indian tax invoices with complete price snapshots.
8. **Returns & Customer Support**:
   - Customer return submission portal with configurable return window and reason recording.
   - Public return tracking reference lookup.
9. **In-Store Tailoring Showcase**:
   - Dedicated atelier page highlighting bespoke tailoring, blouse stitching, and custom fittings.
   - Contact and store-visit instructions (no unverified online bookings in Version 1).

### B. Admin Operations Dashboard (`/admin`)
1. **Live Analytics & Overview**: Real database metrics for total orders, products, low-stock variants, verified revenue, and return requests.
2. **Product & Variant Matrix Management**: Add/edit clothing products, manage multi-size/color variants, and safe-archive items without breaking past order references.
3. **Strict Price Edit Controls**: Backend enforces that only authenticated administrators can alter prices.
4. **Order Fulfilment**: Update order status (`Placed`, `Confirmed`, `Processing`, `Packed`, `Shipped`, `Out for Delivery`, `Delivered`).
5. **Audited Invoice Adjustments**: Controlled adjustments for discounts, delivery fees, or taxes requiring a mandatory operational reason (>5 characters) and logging immutable audit entries.
6. **Delivery Zones & PIN Codes**: Manage serviceable 6-digit Indian PIN codes, delivery fees in INR, and activation toggles.
7. **Returns & Manual Refund Recording**: Inspect returns, update return status, and record manual refunds with UTR/bank references for financial reconciliation.
8. **Discounts & Coupons**: Manage percentage and flat discounts with minimum order thresholds and maximum discount caps.
9. **Traceable Audit Logs**: Permanent log of all sensitive admin actions (price changes, stock edits, invoice modifications, refunds).
10. **Store Information & Policies**: Edit announcement bar, boutique contact details, COD limits, and return policy terms.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router 6, Vanilla CSS with custom design tokens, Lucide React icons, Axios.
- **Backend**: Node.js, Express.js (REST API architecture), Rate Limiting, Helmet security headers, CORS protection.
- **Database**: MongoDB with Mongoose ODM (Indexes, schema validation, and atomic `$inc` stock operations).
- **Security**: Bcrypt password hashing, JWT tokens, environment-based credentials.
- **Storage Adapter**: Local Disk Storage Adapter (Development) / Cloudinary Adapter (Production).
- **Payment Adapter**: Explicit Mock Payment Gateway (Development) / Razorpay with HMAC-SHA256 signature verification (Production).

---

## 🔐 Environment Variables & Security Rules

All private credentials are kept strictly in `server/.env`.
A clean template with placeholder values is provided in `server/.env.example`.
The root `.gitignore` excludes `.env`, `node_modules`, build outputs, and logs while allowing `.env.example`.

### Startup Validation
Backend validates environment configuration upon boot (`server/src/config/env.js`). If optional credentials (Razorpay or Cloudinary) are omitted, the server safely initializes in **development mode**:
- **Payment Provider**: Uses `MockPaymentProvider` labeled `[DEV MOCK PAYMENT]` (never claims real transactions).
- **Image Storage**: Uses `LocalStorageAdapter` in `server/uploads/`.

---

## 🏃 Quick Start Guide

### 1. Configure Server Environment
```bash
cd server
cp .env.example .env
```

### 2. Seed the Database
Ensure your local MongoDB is running (`mongodb://127.0.0.1:27017`), then run:
```bash
cd server
npm run seed
```

### 3. Run Automated Tests
```bash
cd server
npm test
```
All 25 integration tests will execute and confirm system integrity.

### 4. Start the Application
- **Start Backend** (Port 5000):
  ```bash
  cd server
  npm run dev
  ```
- **Start Frontend** (Port 5173):
  ```bash
  cd client
  npm run dev
  ```
Open `http://localhost:5173` in your browser.

---

## 🔑 Default Credentials

- **Admin Portal**:
  - URL: `http://localhost:5173/admin/login`
  - Email: `admin@jashviboutique.com`
  - Password: `JashviAdmin@2026!`
- **Demo Customer**:
  - URL: `http://localhost:5173/login`
  - Email: `customer@example.com`
  - Password: `CustomerPass@2026`

---

## 📚 Documentation
- [Setup & Operational Guide](docs/SETUP_GUIDE.md)
- [REST API Reference](docs/API_DOCUMENTATION.md)
