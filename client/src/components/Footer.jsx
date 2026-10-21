import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Mail, Heart, Scissors, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <img
                src="/assets/images/jashvi-logo.png"
                alt="Jashvi Boutique"
                style={{ height: '48px', width: 'auto', filter: 'brightness(1.1)' }}
              />
            </div>
            <p style={{ color: '#B5AFA9', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.6' }}>
              Mangalore's premier ladies' boutique specializing in handcrafted Indian ethnic wear, ready-to-wear kurtis, royal bridal lehengas, and bespoke in-store master tailoring.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: '#D5CFC9' }}>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <MapPin size={18} color="#C98491" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  #G1, Ground Floor, Bloom Residency,<br />
                  Victor Bishop Road, Attavara,<br />
                  Mangalore, Karnataka 575001, India
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <Phone size={16} color="#C98491" />
                <span>+91 8050853393</span>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <Clock size={16} color="#C98491" />
                <span>10:00 AM – 8:30 PM (Sunday Closed)</span>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <Mail size={16} color="#C98491" />
                <span>contact@jashviboutique.com</span>
              </div>
            </div>
          </div>

          {/* Quick Collections */}
          <div>
            <h4 className="footer-title">Collections</h4>
            <ul className="footer-links">
              <li><Link to="/products?category=kurtas-and-kurtis">Kurtas & Kurtis</Link></li>
              <li><Link to="/products?category=festive-and-bridal">Festive & Bridal Lehengas</Link></li>
              <li><Link to="/products?category=dress-materials">Pure Silk Dress Materials</Link></li>
              <li><Link to="/products?category=pants-and-palazzos">Pants & Palazzos</Link></li>
              <li><Link to="/products?category=leggings">Ankle Leggings & Churidars</Link></li>
              <li><Link to="/products?category=nightwear">Cotton Loungewear</Link></li>
              <li><Link to="/products">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Boutique Services & Policies */}
          <div>
            <h4 className="footer-title">Customer Care</h4>
            <ul className="footer-links">
              <li><Link to="/tailoring">In-Store Bespoke Tailoring</Link></li>
              <li><Link to="/track-order">Track Your Order</Link></li>
              <li><Link to="/orders">Order History & Invoices</Link></li>
              <li><Link to="/returns-policy">Return & Refund Policy</Link></li>
              <li><Link to="/shipping-policy">Shipping & Delivery Info</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Boutique Trust & Tailoring Highlight */}
          <div>
            <h4 className="footer-title">Visit Our Atelier</h4>
            <p style={{ color: '#B5AFA9', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: '1.6' }}>
              Experience personalized fit and custom blouse stitching at our Attavara studio. Walk in during boutique hours for measurements & fabric consultations.
            </p>
            <Link to="/tailoring" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
              <Scissors size={14} color="#C98491" /> Explore Tailoring Services
            </Link>

            <div style={{ marginTop: '1.5rem', padding: '0.85rem', backgroundColor: '#2C2725', borderRadius: '6px', border: '1px solid #3D3734' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#C98491', fontWeight: 600, fontSize: '0.8rem' }}>
                <Shield size={14} /> 100% Authentic Indian Craftsmanship
              </div>
              <p style={{ fontSize: '0.75rem', color: '#9E9792', marginTop: '0.25rem' }}>
                Every garment is curated, inspected, and tailored with utmost care in Mangalore.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Jashvi Boutique, Attavara, Mangalore. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/shipping-policy">Shipping</Link>
            <Link to="/returns-policy">Returns</Link>
            <Link to="/admin" style={{ color: '#6A635E' }}>Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
