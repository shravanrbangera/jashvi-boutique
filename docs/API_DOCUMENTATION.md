# Jashvi Boutique — API Reference Documentation

All API routes are prefixed with `/api`. Protected routes require a Bearer token in the `Authorization` header (`Bearer <token>`).

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register customer (`name`, `email`, `password`, `phone`) |
| `POST` | `/api/auth/login` | Public | Authenticate user; returns JWT token & user payload |
| `POST` | `/api/auth/forgot-password` | Public | Request password reset token |
| `POST` | `/api/auth/reset-password` | Public | Reset password using verified token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |

---

## 2. Products & Categories (`/api/products`, `/api/categories`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | Search, filter by category/price, and sort products |
| `GET` | `/api/products/:id` | Public | Retrieve single product details with variant stock matrix |
| `POST` | `/api/products` | Admin | Create product with multiple images & variant matrix |
| `PUT` | `/api/products/:id` | Admin | Update product details, prices, or variants |
| `PATCH` | `/api/products/:id/price` | Admin | Dedicated audited price update endpoint |
| `DELETE` | `/api/products/:id` | Admin | Safe archive product (preserves historical order integrity) |
| `GET` | `/api/categories` | Public | List published categories |
| `POST` | `/api/categories` | Admin | Create new category |
| `PUT` | `/api/categories/:id` | Admin | Rename, reorder, or toggle category status |

---

## 3. Cart & Wishlist (`/api/cart`, `/api/wishlist`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/cart` | Authenticated | Retrieve customer cart with live server price checks |
| `POST` | `/api/cart/items` | Authenticated | Add item variant to cart |
| `PATCH` | `/api/cart/items/:id` | Authenticated | Update item quantity |
| `DELETE` | `/api/cart/items/:id` | Authenticated | Remove item from cart |
| `POST` | `/api/cart/clear` | Authenticated | Clear all items from cart |
| `GET` | `/api/wishlist` | Authenticated | Retrieve customer wishlist |
| `POST` | `/api/wishlist` | Authenticated | Add product to wishlist |
| `DELETE` | `/api/wishlist/:productId` | Authenticated | Remove product from wishlist |

---

## 4. Delivery & Serviceable PIN Codes (`/api/delivery`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/delivery/check` | Public | Check serviceability and delivery fee for a 6-digit PIN |
| `GET` | `/api/delivery/zones` | Admin | List all configured delivery zones |
| `POST` | `/api/delivery/zones` | Admin | Create new serviceable PIN code & delivery fee |
| `PUT` | `/api/delivery/zones/:id` | Admin | Update delivery fee, estimated days, or toggle approval |

---

## 5. Orders & Tracking (`/api/orders`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders` | Authenticated | Create order with atomic inventory deduction & pricing calculation |
| `GET` | `/api/orders` | Authenticated / Admin | Retrieve orders (filtered by user if customer, all if admin) |
| `GET` | `/api/orders/:id` | Authenticated | View order details |
| `POST` | `/api/orders/track` | Public | Verified order tracking (requires matching `orderNumber` + `phone`) |
| `PATCH` | `/api/orders/:id/status` | Admin | Update fulfilment status (`Placed`, `Shipped`, `Delivered`, etc.) |

---

## 6. Payments (`/api/payments`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/payments/create-order` | Authenticated | Create payment order (`mock` or `razorpay`) |
| `POST` | `/api/payments/verify` | Authenticated | Verify signature and confirm payment |
| `POST` | `/api/payments/webhook` | Webhook / Public | Idempotent webhook receiver for gateway notifications |

---

## 7. Invoices & Audits (`/api/invoices`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/invoices` | Admin | List all invoices with pagination & search |
| `GET` | `/api/invoices/:identifier` | Authenticated | View invoice (accessible by order owner or admin) |
| `POST` | `/api/invoices/:id/adjust` | Admin | Controlled financial adjustment with mandatory reason |
| `GET` | `/api/invoices/:id/adjustments` | Admin | View complete immutable adjustment history |

---

## 8. Returns & Refunds (`/api/returns`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/returns` | Authenticated | Submit return request for an item |
| `GET` | `/api/returns/my-returns` | Authenticated | List logged-in customer's return requests |
| `GET` | `/api/returns/track/:returnNumber`| Public | Track return progress by return reference # |
| `GET` | `/api/returns` | Admin | View and filter all return requests |
| `PATCH` | `/api/returns/:id/status` | Admin | Update return status (`Approved`, `Inspecting`, etc.) |
| `POST` | `/api/returns/:id/refund` | Admin | Record manual refund (amount, method, UTR/ref #) |

---

## 9. Admin Overview & Reports (`/api/admin`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/overview` | Admin | Aggregated dashboard stats (orders, revenue, low stock) |
| `GET` | `/api/admin/audit-logs` | Admin | Filterable log of sensitive administrative actions |
| `GET` | `/api/admin/reports` | Admin | Breakdown by payment method, top products, sales by status |
| `GET` | `/api/admin/customers` | Admin | List registered customers & order counts |

---

## 10. Store Settings (`/api/settings`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/settings` | Public | Store details, address, hours, announcement bar |
| `PUT` | `/api/settings` | Admin | Update boutique information & policies |
