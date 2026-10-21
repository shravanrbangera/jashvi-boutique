import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, FileText, Lock } from 'lucide-react';

export default function Policies({ defaultTab = 'shipping' }) {
  const location = useLocation();
  const getInitialTab = () => {
    if (location.pathname.includes('return')) return 'returns';
    if (location.pathname.includes('privacy')) return 'privacy';
    if (location.pathname.includes('terms')) return 'terms';
    return defaultTab;
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  return (
    <div style={{ backgroundColor: '#FDFBF9', padding: '3.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C98491', fontWeight: 700 }}>
            Legal & Customer Safeguards
          </span>
          <h1 style={{ fontSize: '2.4rem', marginTop: '0.25rem' }}>Boutique Policies</h1>
          <p style={{ color: '#5C5552', marginTop: '0.5rem' }}>
            Transparency, fair consumer practices, and clear guidelines for Jashvi Boutique shoppers.
          </p>
        </div>

        {/* Tab Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            borderBottom: '1px solid #EAE7E4',
            paddingBottom: '1rem',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setActiveTab('shipping')}
            className={`btn btn-sm ${activeTab === 'shipping' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Truck size={15} /> Shipping Policy
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={`btn btn-sm ${activeTab === 'returns' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <RotateCcw size={15} /> Return & Refund Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`btn btn-sm ${activeTab === 'terms' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <FileText size={15} /> Terms & Conditions
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`btn btn-sm ${activeTab === 'privacy' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Lock size={15} /> Privacy Policy
          </button>
        </div>

        {/* Content Sheet */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #EAE7E4',
            borderRadius: '12px',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-sm)',
            lineHeight: 1.8,
            color: '#262322',
            fontSize: '0.95rem',
          }}
        >
          {activeTab === 'shipping' && (
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '1.25rem' }}>Shipping & Delivery Policy</h2>
              <p>
                At <strong>Jashvi Boutique</strong>, we take pride in prompt, careful packaging and dispatch of all ready-to-wear clothing and dress materials.
              </p>
              <h3 style={{ fontSize: '1.15rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Delivery Zones & Charges</h3>
              <p>
                • <strong>Mangalore City Deliveries:</strong> All orders above ₹1,999 qualify for complimentary boutique shipping. Local deliveries within Mangalore municipal limits are dispatched within 24 to 48 hours.<br />
                • <strong>Karnataka & Interstate Deliveries:</strong> Rates are calculated dynamically based on admin-approved PIN code zones (typically ₹49 - ₹199). Deliveries take between 2 to 6 business days depending on transit routes.
              </p>
              <h3 style={{ fontSize: '1.15rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. Order Tracking</h3>
              <p>
                Every customer receives a secure Order Number and tracking capability. Private tracking on our website requires verification using the phone number supplied at checkout to safeguard customer addresses.
              </p>
              <h3 style={{ fontSize: '1.15rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. In-Store Local Pickup</h3>
              <p>
                Customers residing in Mangalore may also opt for in-store pickup at our Attavara studio (#G1 Bloom Residency) during working hours (10:00 AM – 8:30 PM, Mon–Sat).
              </p>
            </div>
          )}

          {activeTab === 'returns' && (
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '1.25rem' }}>Return & Refund Policy</h2>
              <div
                style={{
                  backgroundColor: '#FFF8F9',
                  border: '1px solid #F1DFE2',
                  padding: '1rem',
                  borderRadius: '6px',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                  color: '#A86472',
                }}
              >
                <em>Note: In accordance with boutique policy requirements, return windows and conditions are managed through the admin settings and remain configurable by the boutique owner.</em>
              </div>

              <h3 style={{ fontSize: '1.15rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Return Eligibility</h3>
              <p>
                • Ready-made garments (kurtis, pants, standard size sets) in their original unworn condition with brand tags attached may be returned within <strong>7 days of delivery</strong>.<br />
                • To initiate a return, customers must submit an online Return Request via their order details dashboard or contact the boutique team.<br />
                • Customized garments, stitched-to-measure blouses, and fabrics cut to custom length are personalized services and are strictly non-returnable.
              </p>

              <h3 style={{ fontSize: '1.15rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. Refund Processing</h3>
              <p>
                • Once a returned garment is received and inspected at our Attavara studio, the refund is processed manually by our boutique administration.<br />
                • For online payments, refunds are recorded against the original transaction reference. For Cash on Delivery orders, refunds are coordinated via direct UPI transfer or bank NEFT upon customer agreement.<br />
                • In-store exchanges are warmly welcomed at our boutique in Attavara, Mangalore.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '1.25rem' }}>Terms & Conditions</h2>
              <p>
                By using the <strong>Jashvi Boutique</strong> website and placing an order, you agree to the following operational terms:
              </p>
              <h3 style={{ fontSize: '1.15rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Pricing & Currency</h3>
              <p>
                All prices displayed on this website are in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. Prices are subject to administrative modification; confirmed orders will always preserve their snapshot prices.
              </p>
              <h3 style={{ fontSize: '1.15rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. In-Store Tailoring Consultations</h3>
              <p>
                Tailoring, alterations, and custom bridal stitching are in-store services conducted at our Attavara boutique. Turnaround times and custom pricing are quoted in person after inspecting design complexity and fabric requirements.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '1.25rem' }}>Privacy & Data Protection</h2>
              <p>
                Jashvi Boutique respects your privacy and ensures your personal information is protected:
              </p>
              <h3 style={{ fontSize: '1.15rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Information We Collect</h3>
              <p>
                We only collect information necessary to fulfill your orders: name, phone number, delivery address, and account email. We never sell, share, or monetize your contact information.
              </p>
              <h3 style={{ fontSize: '1.15rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. Payment Security</h3>
              <p>
                Online payments are processed through encrypted 256-bit SSL gateways. Jashvi Boutique never stores customer credit card numbers, debit card PINs, or net banking passwords on our servers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
