import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatINR } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import {
  Truck,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  X,
  MapPin,
  AlertCircle,
} from 'lucide-react';

export default function AdminDeliveryZones() {
  const { addToast } = useToast();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    pincode: '',
    zoneName: '',
    city: 'Mangalore',
    state: 'Karnataka',
    deliveryCharge: 0,
    estimatedDays: '1 - 2 business days',
    isServiceable: true,
    isApproved: true,
    isActive: true,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const res = await api.get('/delivery/zones');
      if (res.data.success) {
        setZones(res.data.zones || []);
      }
    } catch (err) {
      addToast('Failed to load delivery zones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingZone(null);
    setFormData({
      pincode: '',
      zoneName: 'Mangalore Urban',
      city: 'Mangalore',
      state: 'Karnataka',
      deliveryCharge: 50,
      estimatedDays: '1 - 2 business days',
      isServiceable: true,
      isApproved: true,
      isActive: true,
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      pincode: zone.pincode,
      zoneName: zone.zoneName,
      city: zone.city,
      state: zone.state,
      deliveryCharge: zone.deliveryCharge,
      estimatedDays: zone.estimatedDays,
      isServiceable: zone.isServiceable,
      isApproved: zone.isApproved,
      isActive: zone.isActive,
      notes: zone.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(formData.pincode.trim())) {
      addToast('PIN code must be a valid 6-digit Indian Postal Code', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      if (editingZone) {
        const res = await api.put(`/delivery/zones/${editingZone._id}`, formData);
        if (res.data.success) {
          addToast('Delivery zone updated successfully', 'success');
          setShowModal(false);
          fetchZones();
        }
      } else {
        const res = await api.post('/delivery/zones', formData);
        if (res.data.success) {
          addToast('New delivery zone & PIN code registered', 'success');
          setShowModal(false);
          fetchZones();
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save delivery zone', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (zone, field) => {
    try {
      const updated = { ...zone, [field]: !zone[field] };
      const res = await api.put(`/delivery/zones/${zone._id}`, updated);
      if (res.data.success) {
        addToast(`Zone updated (${field}: ${updated[field] ? 'Active' : 'Inactive'})`, 'info');
        fetchZones();
      }
    } catch (err) {
      addToast('Failed to toggle zone status', 'error');
    }
  };

  const filteredZones = zones.filter((z) => {
    const q = search.toLowerCase();
    return (
      z.pincode.includes(q) ||
      z.city?.toLowerCase().includes(q) ||
      z.zoneName?.toLowerCase().includes(q) ||
      z.state?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#262322' }}>
            Delivery Zones & Serviceable PIN Codes
          </h1>
          <p style={{ color: '#6E6765', fontSize: '0.9rem' }}>
            Admin-approved PIN codes for checkout serviceability and delivery fee calculation in INR.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FFFFFF', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #D5CFC9' }}>
            <Search size={18} color="#8C827A" />
            <input
              type="text"
              placeholder="Search PIN code, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '0.875rem', width: '180px' }}
            />
          </div>

          <button
            onClick={handleOpenAdd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#262322',
              color: '#FFFFFF',
              padding: '0.6rem 1.1rem',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            Add PIN Code
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #EAE7E4', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6E6765' }}>Loading delivery zones...</div>
        ) : filteredZones.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8C827A' }}>
            <MapPin size={42} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p>No delivery zones found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9F8F6', borderBottom: '1px solid #EAE7E4', color: '#6E6765', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>PIN Code</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Zone / Area</th>
                  <th style={{ padding: '0.85rem 1rem' }}>City & State</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Delivery Fee (₹)</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Estimated Days</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Serviceable</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Admin Approved</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredZones.map((z) => (
                  <tr key={z._id} style={{ borderBottom: '1px solid #F1EFEA' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#262322' }}>
                      <span style={{ backgroundColor: '#F4F1EA', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                        {z.pincode}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#262322', fontWeight: 500 }}>
                      {z.zoneName}
                    </td>
                    <td style={{ padding: '1rem', color: '#6E6765' }}>
                      {z.city}, {z.state}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: z.deliveryCharge === 0 ? '#16A34A' : '#262322' }}>
                      {z.deliveryCharge === 0 ? 'FREE' : formatINR(z.deliveryCharge)}
                    </td>
                    <td style={{ padding: '1rem', color: '#6E6765', fontSize: '0.8rem' }}>
                      {z.estimatedDays}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => handleToggleStatus(z, 'isServiceable')}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          color: z.isServiceable ? '#16A34A' : '#DC2626',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {z.isServiceable ? <CheckCircle size={15} /> : <XCircle size={15} />}
                        {z.isServiceable ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => handleToggleStatus(z, 'isApproved')}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          color: z.isApproved ? '#16A34A' : '#DC2626',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {z.isApproved ? <CheckCircle size={15} /> : <XCircle size={15} />}
                        {z.isApproved ? 'Approved' : 'Pending'}
                      </button>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenEdit(z)}
                        style={{
                          padding: '0.35rem 0.65rem',
                          borderRadius: '4px',
                          border: '1px solid #D5CFC9',
                          background: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}
                      >
                        <Edit2 size={13} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', maxWidth: '520px', width: '100%', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #EAE7E4', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#262322' }}>
                {editingZone ? `Edit PIN Code: ${editingZone.pincode}` : 'Add Serviceable PIN Code'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#6E6765" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.25rem' }}>
                    PIN Code (6 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    placeholder="e.g. 575001"
                    disabled={!!editingZone}
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.25rem' }}>
                    Delivery Charge (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={formData.deliveryCharge}
                    onChange={(e) => setFormData({ ...formData, deliveryCharge: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.25rem' }}>
                  Zone / Area Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Attavara / Hampankatta"
                  value={formData.zoneName}
                  onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.25rem' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.25rem' }}>
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.25rem' }}>
                  Estimated Delivery Timeline
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 - 2 business days"
                  value={formData.estimatedDays}
                  onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', margin: '1rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isServiceable}
                    onChange={(e) => setFormData({ ...formData, isServiceable: e.target.checked })}
                  />
                  Serviceable for Checkout
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isApproved}
                    onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                  />
                  Admin Approved
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #D5CFC9', background: '#FFFFFF', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.6rem 1.25rem', borderRadius: '6px', border: 'none', background: '#262322', color: '#FFFFFF', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Saving...' : editingZone ? 'Update Zone' : 'Create Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
