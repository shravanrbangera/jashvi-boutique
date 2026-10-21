import React from 'react';
import { NavLink, Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Shirt,
  Tags,
  Boxes,
  ShoppingBag,
  FileText,
  Truck,
  RotateCcw,
  TicketPercent,
  Users,
  ScrollText,
  Settings,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export default function AdminLayout() {
  const { user, isAdmin, loading, logout } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '6rem 0' }}>Verifying administrative credentials...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Manage Products', icon: Shirt },
    { to: '/admin/categories', label: 'Product Categories', icon: Tags },
    { to: '/admin/inventory', label: 'Inventory Matrix', icon: Boxes },
    { to: '/admin/orders', label: 'Customer Orders', icon: ShoppingBag },
    { to: '/admin/invoices', label: 'Invoices & Audits', icon: FileText },
    { to: '/admin/delivery', label: 'Delivery Zones & PINs', icon: Truck },
    { to: '/admin/returns', label: 'Returns & Refunds', icon: RotateCcw },
    { to: '/admin/coupons', label: 'Coupons & Discounts', icon: TicketPercent },
    { to: '/admin/customers', label: 'Customer Accounts', icon: Users },
    { to: '/admin/audit-logs', label: 'Audit Logs & Reports', icon: ScrollText },
    { to: '/admin/settings', label: 'Store Information', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F1EA' }}>
      {/* Admin Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#1E1B1A',
          color: '#EAE7E4',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          borderRight: '1px solid #332E2C',
          zIndex: 50,
          flexShrink: 0,
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #332E2C' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img
              src="/assets/images/jashvi-logo.png"
              alt="Jashvi Boutique"
              style={{ height: '36px', width: 'auto' }}
            />
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C98491', fontWeight: 700 }}>
                Operations
              </span>
              <p style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 600 }}>Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: isActive ? '#FFFFFF' : '#A09893',
                      backgroundColor: isActive ? '#C98491' : 'transparent',
                      transition: 'all 0.2s ease',
                    })}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer controls */}
        <div style={{ padding: '1rem', borderTop: '1px solid #332E2C', backgroundColor: '#181514' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#C98491', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
              {user.name?.charAt(0) || 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {user.name}
              </p>
              <p style={{ fontSize: '0.7rem', color: '#8C8681' }}>Authorized Administrator</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              to="/"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                color: '#D5CFC9',
                backgroundColor: '#2A2524',
                padding: '6px',
                borderRadius: '4px',
              }}
            >
              <ExternalLink size={13} /> View Store
            </Link>

            <button
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF5350',
                backgroundColor: '#2A2524',
                padding: '6px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              title="Logout from Admin"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', maxWidth: 'calc(100vw - 260px)' }}>
        <Outlet />
      </main>
    </div>
  );
}
