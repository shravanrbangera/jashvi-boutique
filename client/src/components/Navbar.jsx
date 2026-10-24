import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  Scissors,
  LogOut,
  Package,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { wishlistItems } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catalogDropdownOpen, setCatalogDropdownOpen] = useState(false);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isCatalogActive =
    location.pathname.startsWith('/products') || location.pathname.startsWith('/category');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="site-header">
      <div className="container nav-container">
        {/* Mobile Menu Hamburger */}
        <button
          className="mobile-nav-toggle nav-icon-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Brand Logo */}
        <Link to="/" className="brand-logo-wrap">
          <img
            src="/assets/images/jashvi-logo.png"
            alt="Jashvi Boutique"
            className="brand-logo-img"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav>
          <ul className="nav-links">
            <li>
              <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Home
              </NavLink>
            </li>

            {/* Consolidated All Catalog with Luxury Dropdown */}
            <li
              style={{ position: 'relative' }}
              onMouseEnter={() => setCatalogDropdownOpen(true)}
              onMouseLeave={() => setCatalogDropdownOpen(false)}
            >
              <Link
                to="/products"
                className={`nav-link ${isCatalogActive ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
              >
                <span>All Catalog</span>
                <ChevronDown
                  size={14}
                  style={{
                    transition: 'transform 0.2s ease',
                    transform: catalogDropdownOpen ? 'rotate(180deg)' : 'none',
                    color: isCatalogActive ? 'var(--accent-rose)' : 'inherit',
                  }}
                />
              </Link>

              {catalogDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '230px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #EAE7E4',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    padding: '0.4rem 0',
                    zIndex: 110,
                  }}
                >
                  <Link
                    to="/products"
                    onClick={() => setCatalogDropdownOpen(false)}
                    style={{
                      display: 'block',
                      padding: '0.65rem 1.25rem',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid #F1EFEA',
                      backgroundColor: '#FDFBF9',
                    }}
                  >
                    View Entire Catalog
                  </Link>
                  <Link
                    to="/products?category=kurtas-and-kurtis"
                    onClick={() => setCatalogDropdownOpen(false)}
                    style={{ display: 'block', padding: '0.55rem 1.25rem', fontSize: '0.85rem', color: '#5C5552' }}
                  >
                    Kurtas & Kurtis
                  </Link>
                  <Link
                    to="/products?category=festive-and-bridal"
                    onClick={() => setCatalogDropdownOpen(false)}
                    style={{ display: 'block', padding: '0.55rem 1.25rem', fontSize: '0.85rem', color: '#5C5552' }}
                  >
                    Festive & Bridal
                  </Link>
                  <Link
                    to="/products?category=dress-materials"
                    onClick={() => setCatalogDropdownOpen(false)}
                    style={{ display: 'block', padding: '0.55rem 1.25rem', fontSize: '0.85rem', color: '#5C5552' }}
                  >
                    Dress Materials
                  </Link>
                  <Link
                    to="/products?category=pants-and-palazzos"
                    onClick={() => setCatalogDropdownOpen(false)}
                    style={{ display: 'block', padding: '0.55rem 1.25rem', fontSize: '0.85rem', color: '#5C5552' }}
                  >
                    Pants & Palazzos
                  </Link>
                  <Link
                    to="/products?category=leggings-and-bottoms"
                    onClick={() => setCatalogDropdownOpen(false)}
                    style={{ display: 'block', padding: '0.55rem 1.25rem', fontSize: '0.85rem', color: '#5C5552' }}
                  >
                    Leggings & Bottoms
                  </Link>
                  <Link
                    to="/products?category=nightwear-and-loungewear"
                    onClick={() => setCatalogDropdownOpen(false)}
                    style={{ display: 'block', padding: '0.55rem 1.25rem', fontSize: '0.85rem', color: '#5C5552' }}
                  >
                    Nightwear & Loungewear
                  </Link>
                </div>
              )}
            </li>

            <li>
              <NavLink
                to="/tailoring"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Scissors size={15} color="#C98491" />
                <span>Tailoring Atelier</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                About
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Action Icons */}
        <div className="nav-actions">
          {/* Search Toggle */}
          <button
            className="nav-icon-btn"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search clothing"
          >
            <Search size={20} />
          </button>

          {/* Wishlist */}
          <Link to="/wishlist" className="nav-icon-btn" aria-label="Wishlist">
            <Heart size={20} />
            {wishlistItems.length > 0 && (
              <span className="badge-count">{wishlistItems.length}</span>
            )}
          </Link>

          {/* User Account Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="nav-icon-btn"
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              aria-label="User Account"
              style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              <User size={20} />
              {isAuthenticated && <ChevronDown size={14} />}
            </button>

            {accountMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EAE7E4',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(38,35,34,0.12)',
                  minWidth: '220px',
                  zIndex: 200,
                  padding: '0.5rem 0',
                }}
              >
                {isAuthenticated ? (
                  <>
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #EAE7E4',
                        backgroundColor: '#FDFBF9',
                      }}
                    >
                      <p style={{ fontWeight: 600, color: '#262322', fontSize: '0.9rem' }}>
                        {user.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#8A817D' }}>{user.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setAccountMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.65rem 1rem',
                          fontSize: '0.9rem',
                          color: '#C98491',
                          fontWeight: 600,
                        }}
                      >
                        <ShieldCheck size={16} /> Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/account"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.65rem 1rem',
                        fontSize: '0.9rem',
                        color: '#262322',
                      }}
                    >
                      <User size={16} /> My Profile & Addresses
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.65rem 1rem',
                        fontSize: '0.9rem',
                        color: '#262322',
                      }}
                    >
                      <Package size={16} /> My Orders
                    </Link>

                    <Link
                      to="/track-order"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.65rem 1rem',
                        fontSize: '0.9rem',
                        color: '#262322',
                      }}
                    >
                      <Package size={16} /> Track An Order
                    </Link>

                    <div style={{ borderTop: '1px solid #EAE7E4', margin: '0.4rem 0' }} />

                    <button
                      onClick={() => {
                        logout();
                        setAccountMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.65rem 1rem',
                        fontSize: '0.9rem',
                        color: '#D32F2F',
                        width: '100%',
                        textAlign: 'left',
                      }}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ padding: '0.75rem 1rem' }}>
                      <p style={{ fontSize: '0.85rem', color: '#5C5552', marginBottom: '0.75rem' }}>
                        Welcome to Jashvi Boutique
                      </p>
                      <Link
                        to="/login"
                        onClick={() => setAccountMenuOpen(false)}
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setAccountMenuOpen(false)}
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%' }}
                      >
                        Create Account
                      </Link>
                    </div>
                    <div style={{ borderTop: '1px solid #EAE7E4', margin: '0.25rem 0' }} />
                    <Link
                      to="/track-order"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '0.5rem 1rem',
                        fontSize: '0.85rem',
                        color: '#5C5552',
                      }}
                    >
                      Track Order without Login
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart Icon */}
          <Link to="/cart" className="nav-icon-btn" aria-label="Shopping Bag">
            <ShoppingBag size={20} />
            {cart.itemCount > 0 && <span className="badge-count">{cart.itemCount}</span>}
          </Link>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {searchOpen && (
        <div
          style={{
            backgroundColor: '#F7F4F0',
            borderTop: '1px solid #EAE7E4',
            padding: '1rem 0',
          }}
        >
          <div className="container">
            <form
              onSubmit={handleSearchSubmit}
              style={{ display: 'flex', gap: '0.5rem', maxWidth: '640px', margin: '0 auto' }}
            >
              <input
                type="text"
                placeholder="Search kurtas, bridal lehengas, silk dress materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                autoFocus
              />
              <button type="submit" className="btn btn-primary">
                Search
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSearchOpen(false)}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            top: 'var(--header-height)',
            backgroundColor: 'rgba(38,35,34,0.5)',
            zIndex: 90,
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              width: '280px',
              height: '100%',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '4px 0 16px rgba(0,0,0,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="nav-link"
              style={{ fontSize: '1.05rem', fontWeight: 600 }}
            >
              Home
            </NavLink>
            {/* Mobile All Catalog Accordion */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.4rem 0',
                  cursor: 'pointer',
                }}
                onClick={() => setMobileCatalogOpen(!mobileCatalogOpen)}
              >
                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="nav-link"
                  style={{ fontSize: '1.05rem', fontWeight: 600, padding: 0 }}
                >
                  All Catalog
                </Link>
                <ChevronDown
                  size={16}
                  style={{
                    transform: mobileCatalogOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                    color: '#8C827A',
                  }}
                />
              </div>
              {mobileCatalogOpen && (
                <div style={{ paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderLeft: '2px solid #F1DFE2', marginLeft: '0.3rem', marginTop: '0.25rem' }}>
                  <Link
                    to="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ fontSize: '0.9rem', color: '#262322', fontWeight: 700, padding: '0.2rem 0' }}
                  >
                    View Entire Catalog
                  </Link>
                  <Link
                    to="/products?category=kurtas-and-kurtis"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ fontSize: '0.85rem', color: '#5C5552', padding: '0.2rem 0' }}
                  >
                    Kurtas & Kurtis
                  </Link>
                  <Link
                    to="/products?category=festive-and-bridal"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ fontSize: '0.85rem', color: '#5C5552', padding: '0.2rem 0' }}
                  >
                    Festive & Bridal
                  </Link>
                  <Link
                    to="/products?category=dress-materials"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ fontSize: '0.85rem', color: '#5C5552', padding: '0.2rem 0' }}
                  >
                    Dress Materials
                  </Link>
                  <Link
                    to="/products?category=pants-and-palazzos"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ fontSize: '0.85rem', color: '#5C5552', padding: '0.2rem 0' }}
                  >
                    Pants & Palazzos
                  </Link>
                  <Link
                    to="/products?category=nightwear-and-loungewear"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ fontSize: '0.85rem', color: '#5C5552', padding: '0.2rem 0' }}
                  >
                    Nightwear & Loungewear
                  </Link>
                </div>
              )}
            </div>

            <NavLink
              to="/tailoring"
              onClick={() => setMobileMenuOpen(false)}
              className="nav-link"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#C98491' }}
            >
              <Scissors size={16} /> Bespoke Tailoring
            </NavLink>
            <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className="nav-link">
              About
            </NavLink>
            <NavLink to="/track" onClick={() => setMobileMenuOpen(false)} className="nav-link">
              Track Order
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-link"
                style={{ color: '#C98491', fontWeight: 700 }}
              >
                Admin Dashboard
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
