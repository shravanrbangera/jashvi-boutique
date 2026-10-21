import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Settings,
  Save,
  Store,
  Phone,
  Mail,
  MapPin,
  Clock,
  Megaphone,
  RotateCcw,
  Truck,
  AlertCircle,
} from 'lucide-react';

export default function AdminSettings() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    boutiqueName: 'Jashvi Boutique',
    tagline: "Mangalore's Premier Ladies' Ethnic & Bespoke Fashion Atelier",
    phone: '8050853393',
    email: 'contact@jashviboutique.com',
    address: '#G1, Ground Floor, Bloom Residency, Victor Bishop Road, Attavara, Mangalore, Karnataka 575001',
    storeHours: '10:00 AM to 8:30 PM (Sunday Closed)',
    announcementBar: {
      text: 'Complimentary Boutique Delivery in Mangalore for orders above ₹1,999 | In-Store Custom Tailoring Available',
      isActive: true,
    },
    returnPolicy: {
      windowDays: 7,
      policyText: 'Eligible unworn ready-made clothing with original tags may be returned within 7 days of delivery. Tailored or customized items and unstitched fabrics cut to order are non-returnable. Refunds are processed upon inspection.',
      isConfigured: true,
    },
    freeShippingThreshold: 1999,
    allowCOD: true,
    maxCODAmount: 15000,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data.success && res.data.settings) {
        setFormData((prev) => ({
          ...prev,
          ...res.data.settings,
        }));
      }
    } catch (err) {
      addToast('Failed to load store settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/settings', formData);
      if (res.data.success) {
        addToast('Boutique information & policy settings saved successfully.', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#6E6765' }}>Loading store information...</div>;
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#262322' }}>
          Store Information & Global Policies
        </h1>
        <p style={{ color: '#6E6765', fontSize: '0.9rem' }}>
          Configure verified boutique address, opening hours, announcements, COD thresholds, and return policy.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Boutique Core Identity */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '8px', border: '1px solid #EAE7E4', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', color: '#262322', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Store size={18} color="#C98491" />
            Boutique Identity & Address
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.3rem' }}>
                Boutique Name *
              </label>
              <input
                type="text"
                required
                value={formData.boutiqueName}
                onChange={(e) => setFormData({ ...formData, boutiqueName: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.3rem' }}>
                Tagline / Subheading
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.3rem' }}>
              Physical Boutique Address (Attavara, Mangalore) *
            </label>
            <textarea
              required
              rows="2"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.3rem' }}>
                Contact Phone *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.3rem' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.3rem' }}>
                Store Hours (Owner Timings) *
              </label>
              <input
                type="text"
                required
                value={formData.storeHours}
                onChange={(e) => setFormData({ ...formData, storeHours: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
              />
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '8px', border: '1px solid #EAE7E4', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', color: '#262322', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Megaphone size={18} color="#C98491" />
            Customer Announcement Bar
          </h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.3rem' }}>
              Announcement Message
            </label>
            <input
              type="text"
              value={formData.announcementBar?.text || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  announcementBar: { ...formData.announcementBar, text: e.target.value },
                })
              }
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.announcementBar?.isActive}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  announcementBar: { ...formData.announcementBar, isActive: e.target.checked },
                })
              }
            />
            Display Announcement Bar on Top of Site
          </label>
        </div>

        {/* Return & Refund Policy */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '8px', border: '1px solid #EAE7E4', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', color: '#262322', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RotateCcw size={18} color="#C98491" />
            Configurable Return & Refund Policy
          </h3>

          <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: '#92400E' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Owner Confirmation Notice:</strong> Return rules remain configurable here so the boutique owner can update deadlines, eligible product categories, or exchange policies at any time.
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.3rem' }}>
              Return Window (in Days from Delivery)
            </label>
            <input
              type="number"
              min="0"
              max="30"
              value={formData.returnPolicy?.windowDays || 7}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  returnPolicy: { ...formData.returnPolicy, windowDays: Number(e.target.value) },
                })
              }
              style={{ width: '160px', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.3rem' }}>
              Policy Terms & Inspection Conditions
            </label>
            <textarea
              rows="3"
              value={formData.returnPolicy?.policyText || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  returnPolicy: { ...formData.returnPolicy, policyText: e.target.value },
                })
              }
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        {/* Shipping & Payment Options */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '8px', border: '1px solid #EAE7E4', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', color: '#262322', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={18} color="#C98491" />
            Checkout & Cash on Delivery Thresholds
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.3rem' }}>
                Free Shipping Threshold in INR (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.freeShippingThreshold || 0}
                onChange={(e) => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.3rem' }}>
                Maximum Allowed COD Order in INR (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.maxCODAmount || 15000}
                onChange={(e) => setFormData({ ...formData, maxCODAmount: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.allowCOD}
              onChange={(e) => setFormData({ ...formData, allowCOD: e.target.checked })}
            />
            Allow Cash on Delivery (COD) for Serviceable PIN Codes
          </label>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#262322',
              color: '#FFFFFF',
              padding: '0.75rem 1.75rem',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            <Save size={18} />
            {saving ? 'Saving Settings...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
