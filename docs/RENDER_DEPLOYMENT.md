# Deploying Jashvi Boutique on Render (Step-by-Step Guide)

This guide walks you through deploying the complete **Jashvi Boutique** full-stack application (React frontend + Express API + MongoDB) onto **[Render](https://render.com)**.

---

## Architecture Overview on Render

The repository is configured as a **Unified Full-Stack Web Service**:
- **Build Command:** `npm run build` (Installs server & client dependencies and compiles Vite production assets into `client/dist`).
- **Start Command:** `npm start` (Runs Node.js Express server on Render's assigned port).
- **Static Serving:** Express automatically serves the compiled React application, uploads directory, and REST API from a single URL (`https://your-app.onrender.com`).
- **Auto-Seeding:** On first boot with a fresh database, the server automatically seeds the initial 6 boutique products, categories, delivery PIN codes, and admin account.

---

## Prerequisites (Free)

1. A free **GitHub** account with this repository pushed.
2. A free **Render** account at [render.com](https://render.com).
3. A free **MongoDB Atlas** cloud database at [mongodb.com/atlas](https://www.mongodb.com/atlas).

---

## Step 1: Set Up Free MongoDB Atlas Cloud Database

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **Free Shared Cluster (M0)** (Select AWS / Mumbai, Singapore, or US).
3. Under **Database Access**:
   - Create a database user (e.g., username `jashvi_admin` and a secure password).
4. Under **Network Access**:
   - Click **Add IP Address** -> Select **Allow Access from Anywhere (`0.0.0.0/0`)** -> Confirm.
5. Under **Clusters / Databases**:
   - Click **Connect** -> Choose **Drivers (Node.js)**.
   - Copy your connection string, which looks like:
     ```
     mongodb+srv://jashvi_admin:<password>@cluster0.abcde.mongodb.net/jashvi_boutique?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password.

---

## Step 2: Deploy to Render (Option A: 1-Click Blueprint — Recommended)

Because the project includes an official [`render.yaml`](../render.yaml) file, Render can set up the entire service automatically:

1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** at the top right -> Select **Blueprint**.
3. Connect your GitHub repository (`JASHVI e-commerce clothing brand`).
4. Render will read `render.yaml` and prompt you for the un-synced variable:
   - **`MONGODB_URI`**: Paste your MongoDB Atlas connection string from Step 1.
5. Click **Apply**.
6. Render will automatically build the client, start the backend, and seed the initial boutique products and admin account!

---

## Step 2: Deploy to Render (Option B: Manual Web Service)

If you prefer to configure manually without Blueprint:

1. In Render Dashboard, click **New +** -> **Web Service**.
2. Select your GitHub repository.
3. Configure the settings:
   - **Name:** `jashvi-boutique` (or your choice)
   - **Region:** Any (Oregon / Frankfurt / Singapore)
   - **Branch:** `main` (or `master`)
   - **Root Directory:** *(leave blank)*
   - **Runtime:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Free`
4. Expand **Advanced** -> **Health Check Path**: `/api/health`
5. Under **Environment Variables**, add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production mode & SPA serving |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | *(click Generate)* | 64+ character random string for tokens |
   | `COOKIE_SECRET` | *(click Generate)* | Cookie signature secret |
   | `CLIENT_URL` | `https://jashvi-boutique.onrender.com` | Your Render URL (or custom domain) |
   | `STORAGE_MODE` | `local` | Uses local storage adapter |
   | `PAYMENT_MODE` | `mock` | Dev mock payment gateway (or `razorpay`) |
   | `ADMIN_NAME` | `Jashvi Boutique Admin` | Initial Admin Account Name |
   | `ADMIN_EMAIL` | `admin@jashviboutique.com` | Initial Admin Login Email |
   | `ADMIN_PASSWORD` | `JashviAdmin@2026!` | Initial Admin Login Password |
   | `ADMIN_PHONE` | `8050853393` | Boutique phone number |
6. Click **Create Web Service**.

---

## Step 3: Access Your Live Application

Once Render finishes the build (usually ~2 to 3 minutes):

- **Storefront:** `https://your-service-name.onrender.com`
- **Admin Management Portal:** `https://your-service-name.onrender.com/admin/login`
  - **Email:** `admin@jashviboutique.com`
  - **Password:** `JashviAdmin@2026!`
- **Health Check:** `https://your-service-name.onrender.com/api/health`

---

## Tips & Troubleshooting

- **Cold Starts on Free Tier:** Render free tier spins down web services after 15 minutes of inactivity. When a new visitor arrives, it takes ~30 seconds to wake up.
- **Custom Domain:** You can add your custom domain (e.g., `www.jashviboutique.com`) in Render's **Settings > Custom Domains** with automatic free SSL.
