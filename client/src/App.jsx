import React, { useEffect } from 'react';
import { Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom';

// Layout components
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Customer pages
import Home from './pages/Home';
import AllProducts from './pages/AllProducts';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import TrackOrder from './pages/TrackOrder';
import InvoicePage from './pages/InvoicePage';
import MyAccount from './pages/MyAccount';
import MyOrders from './pages/MyOrders';
import OrderDetailsPage from './pages/OrderDetailsPage';
import ReturnRequestPage from './pages/ReturnRequestPage';
import ReturnStatusPage from './pages/ReturnStatusPage';
import TailoringPage from './pages/TailoringPage';
import WishlistPage from './pages/WishlistPage';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Policies from './pages/Policies';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductEdit from './pages/admin/AdminProductEdit';
import AdminCategories from './pages/admin/AdminCategories';
import AdminInventory from './pages/admin/AdminInventory';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetails from './pages/admin/AdminOrderDetails';
import AdminInvoices from './pages/admin/AdminInvoices';
import AdminDeliveryZones from './pages/admin/AdminDeliveryZones';
import AdminReturns from './pages/admin/AdminReturns';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminSettings from './pages/admin/AdminSettings';

/**
 * Scroll to top on route change
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * Customer Layout with AnnouncementBar, Header, Main Content, and Footer
 */
function CustomerLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <AnnouncementBar />
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Customer Public & Account Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/category/:categorySlug" element={<AllProducts />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/invoices/:identifier" element={<InvoicePage />} />
          <Route path="/orders/:identifier/invoice" element={<InvoicePage />} />
          <Route path="/account" element={<MyAccount />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<OrderDetailsPage />} />
          <Route path="/returns/new" element={<ReturnRequestPage />} />
          <Route path="/returns/track" element={<ReturnStatusPage />} />
          <Route path="/tailoring" element={<TailoringPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/policies/:policy" element={<Policies />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Admin Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Portal */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductEdit />} />
          <Route path="products/:id/edit" element={<AdminProductEdit />} />
          <Route path="products/edit/:id" element={<AdminProductEdit />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetails />} />
          <Route path="invoices" element={<AdminInvoices />} />
          <Route path="delivery" element={<AdminDeliveryZones />} />
          <Route path="returns" element={<AdminReturns />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
