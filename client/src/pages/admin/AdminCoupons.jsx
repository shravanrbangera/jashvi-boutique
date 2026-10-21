import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatINR, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import {
  TicketPercent,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Edit2,
  X,
  Tag,
} from 'lucide-react';

export default function AdminCoupons() {
  const { addToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 999,
    maxDiscountAmount: '',
    validUntil: '',
    usageLimit: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coupons');
      if (res.data.success) {
        setCoupons(res.data.coupons || []);
      }
    } catch (err) {
      addToast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 999,
      maxDiscountAmount: '',
      validUntil: '',
      usageLimit: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      description: c.description || '',
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderValue: c.minOrderValue || 0,
      maxDiscountAmount: c.maxDiscountAmount || '',
      validUntil: c.validUntil ? new Date(c.validUntil).toISOString().split('T')[0] : '',
      usageLimit: c.usageLimit || '',
      isActive: c.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        validUntil: formData.validUntil ? new Date(formData.validUntil) : null,
      };

      if (editingCoupon) {
        const res = await api.put(`/coupons/${editingCoupon._id}`, payload);
        if (res.data.success) {
          addToast('Coupon updated successfully', 'success');
          setShowModal(false);
          fetchCoupons();
        }
      } else {
        const res = await api.post('/coupons', payload);
        if (res.data.success) {
          addToast('New coupon created successfully', 'success');
          setShowModal(false);
          fetchCoupons();
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save coupon', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${code}"?`)) return;
    try {
      const res = await api.delete(`/coupons/${id}`);
      if (res.data.success) {
        addToast(`Coupon ${code} deleted`, 'info');
        fetchCoupons();
      }
    } catch (err) {
      addToast('Failed to delete coupon', 'error');
    }
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#262322' }}>
            Coupons & Discounts
          </h1>
          <p style={{ color: '#6E6765', fontSize: '0.9rem' }}>
            Manage boutique discount vouchers with minimum spend rules and maximum discount caps.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FFFFFF', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #D5CFC9' }}>
            <Search size={18} color="#8C827A" />
            <input
              type="text"
              placeholder="Search code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '0.875rem', width: '160px' }}
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
            Create Coupon
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #EAE7E4', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6E6765' }}>Loading coupons...</div>
        ) : filteredCoupons.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8C827A' }}>
            <TicketPercent size={42} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p>No coupons found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9F8F6', borderBottom: '1px solid #EAE7E4', color: '#6E6765', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Code</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Discount</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Min Order</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Max Cap</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Valid Until</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Used / Limit</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((c) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid #F1EFEA' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#262322' }}>
                      <span style={{ backgroundColor: '#FDF2F4', color: '#C98491', border: '1px dashed #C98491', padding: '0.25rem 0.6rem', borderRadius: '4px', letterSpacing: '0.05em' }}>
                        {c.code}
                      </span>
                      {c.description && (
                        <div style={{ fontSize: '0.75rem', color: '#8C827A', marginTop: '0.25rem' }}>
                          {c.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#16A34A' }}>
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                    </td>
                    <td style={{ padding: '1rem', color: '#262322' }}>
                      {c.minOrderValue > 0 ? formatINR(c.minOrderValue) : 'No min'}
                    </td>
                    <td style={{ padding: '1rem', color: '#6E6765' }}>
                      {c.maxDiscountAmount ? formatINR(c.maxDiscountAmount) : 'None'}
                    </td>
                    <td style={{ padding: '1rem', color: '#6E6765', fontSize: '0.8rem' }}>
                      {c.validUntil ? formatDate(c.validUntil) : 'Permanent'}
                    </td>
                    <td style={{ padding: '1rem', color: '#6E6765', fontSize: '0.85rem' }}>
                      {c.usedCount} / {c.usageLimit || '∞'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: c.isActive ? '#16A34A' : '#DC2626',
                      }}>
                        {c.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '4px',
                            border: '1px solid #D5CFC9',
                            background: '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.75rem',
                          }}
                        >
                          <Edit2 size={13} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c._id, c.code)}
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '4px',
                            border: '1px solid #FECACA',
                            background: '#FFF5F5',
                            color: '#DC2626',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.75rem',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
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
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create Discount Coupon'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#6E6765" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.25rem' }}>
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE15"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.25rem' }}>
                    Discount Type *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.25rem' }}>
                    Discount Value ({formData.discountType === 'percentage' ? '%' : '₹'}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.25rem' }}>
                    Min Order Subtotal (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 999"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.25rem' }}>
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional cap"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.25rem' }}>
                    Valid Until (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.25rem' }}>
                  Description / Terms
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10% off on all festive kurtas and lehengas"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ margin: '1rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Coupon Active & Usable in Cart
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
                  {submitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
