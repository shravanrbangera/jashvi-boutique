import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Trash2, Tag, CheckCircle2, Loader2 } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    displayOrder: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/categories');
      if (res.data?.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openNew = () => {
    setEditingId(null);
    setFormData({ name: '', slug: '', description: '', displayOrder: categories.length + 1, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat._id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      displayOrder: cat.displayOrder || 0,
      isActive: cat.isActive !== undefined ? cat.isActive : true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingId) {
        const res = await api.put(`/products/categories/${editingId}`, formData);
        if (res.data?.success) {
          addToast('Category updated!', 'success');
          setModalOpen(false);
          loadCategories();
        }
      } else {
        const res = await api.post('/products/categories', formData);
        if (res.data?.success) {
          addToast('Category created!', 'success');
          setModalOpen(false);
          loadCategories();
        }
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? Only categories without active products can be deleted.`)) {
      return;
    }
    try {
      const res = await api.delete(`/products/categories/${id}`);
      if (res.data?.success) {
        addToast('Category deleted.', 'info');
        loadCategories();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C98491', fontWeight: 700 }}>
            Catalog Structure
          </span>
          <h1 style={{ fontSize: '2rem', marginTop: '0.2rem' }}>Product Categories</h1>
        </div>

        <button onClick={openNew} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> New Category
        </button>
      </div>

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
            <p>Loading categories...</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#FDFBF9', borderBottom: '1px solid #EAE7E4', color: '#5C5552' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Order</th>
                <th style={{ padding: '0.85rem 1rem' }}>Category Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>URL Slug</th>
                <th style={{ padding: '0.85rem 1rem' }}>Description</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id} style={{ borderBottom: '1px solid #EAE7E4' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{c.displayOrder}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#262322' }}>{c.name}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#C98491' }}>{c.slug}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#5C5552' }}>{c.description || '—'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className={`badge ${c.isActive ? 'badge-success' : 'badge-error'}`}>
                      {c.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => openEdit(c)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c._id, c.name)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#D32F2F' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
              {editingId ? 'Edit Category' : 'Create New Category'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="e.g. Kurtas & Kurtis"
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="form-input"
                  placeholder="Auto-generated if blank"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Display Order</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                  className="form-input"
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span style={{ fontSize: '0.9rem' }}>Active & Visible on Store</span>
              </label>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
