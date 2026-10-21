import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatINR } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { Plus, Search, Edit3, Trash2, Eye, DollarSign, Loader2 } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priceModalData, setPriceModalData] = useState(null);
  const [newRegularPrice, setNewRegularPrice] = useState('');
  const [newSalePrice, setNewSalePrice] = useState('');
  const [priceReason, setPriceReason] = useState('');
  const [updatingPrice, setUpdatingPrice] = useState(false);
  const { addToast } = useToast();

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products?limit=100&search=${encodeURIComponent(search)}`);
      if (res.data?.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from the catalogue? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data?.success) {
        addToast(res.data.message || `Garment "${name}" deleted successfully.`, 'success');
        loadProducts();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete garment.', 'error');
    }
  };

  const handlePriceUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!priceReason || priceReason.trim().length < 3) {
      addToast('A reason for price alteration is required for audit logs.', 'error');
      return;
    }

    try {
      setUpdatingPrice(true);
      const res = await api.patch(`/products/${priceModalData._id}/price`, {
        regularPrice: newRegularPrice,
        salePrice: newSalePrice || null,
        reason: priceReason.trim(),
      });

      if (res.data?.success) {
        addToast('Price altered successfully and logged in audit history.', 'success');
        setPriceModalData(null);
        loadProducts();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUpdatingPrice(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C98491', fontWeight: 700 }}>
            Inventory Management
          </span>
          <h1 style={{ fontSize: '2rem', marginTop: '0.2rem' }}>Clothing Catalogue</h1>
        </div>

        <Link to="/admin/products/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add New Garment
        </Link>
      </div>

      {/* Filter toolbar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #EAE7E4',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search by SKU, product name, or fabric..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem', fontSize: '0.9rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#8A817D' }} />
        </div>
        <span style={{ fontSize: '0.85rem', color: '#8A817D', marginLeft: 'auto' }}>
          Total Garments: <strong>{products.length}</strong>
        </span>
      </div>

      {/* Products Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #EAE7E4',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Loader2 size={32} className="animate-spin" color="#C98491" style={{ margin: '0 auto 1rem' }} />
            <p>Loading catalogue items...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <p style={{ color: '#8A817D' }}>No garments matched your search.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#FDFBF9', borderBottom: '1px solid #EAE7E4', color: '#5C5552' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Garment</th>
                  <th style={{ padding: '0.85rem 1rem' }}>SKU</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Regular Price</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Sale Price</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Total Stock</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const totalStock = p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 0;
                  return (
                    <tr key={p._id} style={{ borderBottom: '1px solid #EAE7E4' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={p.images?.[0] || '/assets/images/purple-embroidered-kurti.jpg'}
                            alt={p.name}
                            style={{ width: '42px', height: '52px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <div>
                            <p style={{ fontWeight: 600, color: '#262322' }}>{p.name}</p>
                            <p style={{ fontSize: '0.75rem', color: '#8A817D' }}>{p.fabric}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5C5552' }}>
                        {p.sku}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>{p.category?.name || 'Standard'}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                        {formatINR(p.regularPrice)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: p.salePrice ? '#2E7D32' : '#8A817D' }}>
                        {p.salePrice ? formatINR(p.salePrice) : '—'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`badge ${totalStock > 3 ? 'badge-success' : totalStock > 0 ? 'badge-warning' : 'badge-error'}`}>
                          {totalStock} in stock
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`badge ${p.status === 'published' ? 'badge-rose' : 'badge-info'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              setPriceModalData(p);
                              setNewRegularPrice(p.regularPrice);
                              setNewSalePrice(p.salePrice || '');
                              setPriceReason('');
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            title="Audit-logged Price Modification"
                          >
                            <DollarSign size={13} /> Price
                          </button>

                          <Link
                            to={`/admin/products/${p._id}/edit`}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            title="Edit details"
                          >
                            <Edit3 size={13} />
                          </Link>

                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#D32F2F', borderColor: '#FFCDD2' }}
                            title="Delete Garment"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Controlled Price Edit Modal with Mandatory Audit Reason */}
      {priceModalData && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              Modify Price: {priceModalData.name}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#8A817D', marginBottom: '1.25rem' }}>
              Only authorized admin modifications can adjust prices. A reason is required for audit logs.
            </p>

            <form onSubmit={handlePriceUpdateSubmit}>
              <div className="form-group">
                <label className="form-label">Regular Price in INR (₹) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newRegularPrice}
                  onChange={(e) => setNewRegularPrice(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sale Price in INR (₹) (Optional)</label>
                <input
                  type="number"
                  min={0}
                  value={newSalePrice}
                  onChange={(e) => setNewSalePrice(e.target.value)}
                  className="form-input"
                  placeholder="Leave empty for no sale discount"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mandatory Reason for Price Change *</label>
                <textarea
                  required
                  rows={3}
                  className="form-textarea"
                  value={priceReason}
                  onChange={(e) => setPriceReason(e.target.value)}
                  placeholder="e.g. Festival promotional adjustment / Mangalore boutique season clearance..."
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPriceModalData(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPrice}
                  className="btn btn-primary btn-sm"
                >
                  {updatingPrice ? <Loader2 size={15} className="animate-spin" /> : 'Confirm & Log Price Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
