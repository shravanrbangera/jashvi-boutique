import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Upload,
  ArrowLeft,
  Trash2,
  Plus,
  ShieldCheck,
  Check,
  X,
  Loader2,
} from 'lucide-react';

export default function AdminProductEdit() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    productType: 'Ready-to-Wear',
    regularPrice: '',
    salePrice: '',
    fabric: 'Pure Cotton Cambric',
    care: 'Dry clean recommended or gentle hand wash separately in cold water.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Standard'],
    images: [],
    variants: [],
    isFeatured: false,
    status: 'published',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [newColorInput, setNewColorInput] = useState('');

  useEffect(() => {
    async function loadInitial() {
      try {
        const catRes = await api.get('/products/categories');
        if (catRes.data?.success) {
          setCategories(catRes.data.categories);
          if (isNew && catRes.data.categories.length > 0) {
            setFormData((prev) => ({ ...prev, category: catRes.data.categories[0]._id }));
          }
        }

        if (!isNew) {
          const prodRes = await api.get(`/products/${id}`);
          if (prodRes.data?.success) {
            const p = prodRes.data.product;
            setFormData({
              name: p.name,
              sku: p.sku,
              description: p.description,
              category: p.category?._id || p.category,
              productType: p.productType,
              regularPrice: p.regularPrice,
              salePrice: p.salePrice || '',
              fabric: p.fabric,
              care: p.care,
              sizes: p.sizes || ['Free Size'],
              colors: p.colors || ['Standard'],
              images: p.images || [],
              variants: p.variants || [],
              isFeatured: p.isFeatured,
              status: p.status,
            });
          }
        }
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
    loadInitial();
  }, [id, isNew, addToast]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const data = new FormData();
      data.append('image', file);

      const res = await api.post('/products/upload-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, res.data.imageUrl],
        }));
        addToast('Garment image uploaded successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addSize = () => {
    if (newSizeInput.trim() && !formData.sizes.includes(newSizeInput.trim())) {
      setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, newSizeInput.trim()] }));
      setNewSizeInput('');
    }
  };

  const removeSize = (sz) => {
    setFormData((prev) => ({ ...prev, sizes: prev.sizes.filter((s) => s !== sz) }));
  };

  const addColor = () => {
    if (newColorInput.trim() && !formData.colors.includes(newColorInput.trim())) {
      setFormData((prev) => ({ ...prev, colors: [...prev.colors, newColorInput.trim()] }));
      setNewColorInput('');
    }
  };

  const removeColor = (cl) => {
    setFormData((prev) => ({ ...prev, colors: prev.colors.filter((c) => c !== cl) }));
  };

  // Re-generate or initialize variant matrix
  const generateVariants = () => {
    const baseSku = formData.sku.toUpperCase() || 'JB-PROD';
    const newVariants = [];

    formData.sizes.forEach((s) => {
      formData.colors.forEach((c) => {
        const variantSku = `${baseSku}-${s.replace(/\s+/g, '')}-${c.replace(/\s+/g, '')}`;
        const existing = formData.variants.find((v) => v.size === s && v.color === c);

        newVariants.push({
          sku: variantSku,
          size: s,
          color: c,
          stock: existing ? existing.stock : 5,
          isAvailable: existing ? existing.isAvailable : true,
        });
      });
    });

    setFormData((prev) => ({ ...prev, variants: newVariants }));
    addToast(`Generated ${newVariants.length} size-colour inventory combinations.`, 'info');
  };

  const updateVariantStock = (index, value) => {
    const next = [...formData.variants];
    next[index].stock = Math.max(0, parseInt(value, 10) || 0);
    setFormData((prev) => ({ ...prev, variants: next }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.sku || !formData.category || !formData.regularPrice) {
      addToast('Please fill all mandatory fields.', 'error');
      return;
    }

    if (formData.images.length === 0) {
      addToast('Please upload at least one image or provide an image URL.', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        regularPrice: Number(formData.regularPrice),
        salePrice: formData.salePrice ? Number(formData.salePrice) : null,
      };

      if (isNew) {
        const res = await api.post('/products', payload);
        if (res.data?.success) {
          addToast('New product created successfully!', 'success');
          navigate('/admin/products');
        }
      } else {
        const res = await api.put(`/products/${id}`, payload);
        if (res.data?.success) {
          addToast('Product details updated successfully.', 'success');
          navigate('/admin/products');
        }
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <Link
        to="/admin/products"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#5C5552', marginBottom: '1.5rem', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>
          {isNew ? 'Create New Clothing Product' : `Edit Garment: ${formData.name}`}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Details Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #EAE7E4',
            borderRadius: '10px',
            padding: '2rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid #EAE7E4', paddingBottom: '0.5rem' }}>
            Garment Identification
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Garment Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                placeholder="e.g. Royal Purple Hand-Embroidered Kurta Set"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Base SKU *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className="form-input"
                placeholder="e.g. JB-KUR-PURPLE-01"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="form-select"
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Product Type</label>
              <select
                value={formData.productType}
                onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                className="form-select"
              >
                <option value="Ready-to-Wear">Ready-to-Wear</option>
                <option value="Unstitched Material">Unstitched Material</option>
                <option value="Festive & Bridal">Festive & Bridal</option>
                <option value="Co-ord Set">Co-ord Set</option>
                <option value="Essentials">Essentials</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Garment Description *</label>
            <textarea
              required
              rows={4}
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe styling details, silhouette, occasion wear, neckline..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Fabric & Weave</label>
              <input
                type="text"
                value={formData.fabric}
                onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                className="form-input"
                placeholder="e.g. Pure Chanderi Silk with Zari border"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Care Instructions</label>
              <input
                type="text"
                value={formData.care}
                onChange={(e) => setFormData({ ...formData, care: e.target.value })}
                className="form-input"
                placeholder="e.g. Dry clean recommended"
              />
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #EAE7E4',
            borderRadius: '10px',
            padding: '2rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid #EAE7E4', paddingBottom: '0.5rem' }}>
            Pricing & Currency (INR)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Regular Price in INR (₹) *</label>
              <input
                type="number"
                required
                min={1}
                value={formData.regularPrice}
                onChange={(e) => setFormData({ ...formData, regularPrice: e.target.value })}
                className="form-input"
                placeholder="2499"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sale Price in INR (₹) (Optional)</label>
              <input
                type="number"
                min={0}
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                className="form-input"
                placeholder="1999"
              />
            </div>
          </div>
        </div>

        {/* Images Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #EAE7E4',
            borderRadius: '10px',
            padding: '2rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid #EAE7E4', paddingBottom: '0.5rem' }}>
            Garment Photography
          </h3>

          {/* Upload Button */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
            >
              {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Upload Image via Storage Adapter
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
            <span style={{ fontSize: '0.8rem', color: '#8A817D', marginLeft: '1rem' }}>
              Supported: JPEG, PNG, WebP (Max 5MB)
            </span>
          </div>

          {/* Image Previews */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {formData.images.map((img, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  width: '100px',
                  height: '130px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: '1px solid #EAE7E4',
                }}
              >
                <img src={img} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#D32F2F',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sizes & Colors Configuration */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #EAE7E4',
            borderRadius: '10px',
            padding: '2rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid #EAE7E4', paddingBottom: '0.5rem' }}>
            Sizes & Colours Configuration
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
            {/* Sizes */}
            <div>
              <label className="form-label">Available Sizes</label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {formData.sizes.map((sz) => (
                  <span
                    key={sz}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#F7F4F0',
                      border: '1px solid #EAE7E4',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                    }}
                  >
                    {sz}
                    <button type="button" onClick={() => removeSize(sz)} style={{ color: '#D32F2F' }}>
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  placeholder="Add size (e.g. XXL)"
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  className="form-input"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                />
                <button type="button" onClick={addSize} className="btn btn-secondary btn-sm">
                  Add
                </button>
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="form-label">Colour Palette</label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {formData.colors.map((cl) => (
                  <span
                    key={cl}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#F1DFE2',
                      border: '1px solid #EAE7E4',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                    }}
                  >
                    {cl}
                    <button type="button" onClick={() => removeColor(cl)} style={{ color: '#D32F2F' }}>
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  placeholder="Add colour (e.g. Navy Blue)"
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  className="form-input"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                />
                <button type="button" onClick={addColor} className="btn btn-secondary btn-sm">
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Generate Variants Button */}
          <button
            type="button"
            onClick={generateVariants}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '1.5rem' }}
          >
            Generate Size-Colour Inventory Matrix
          </button>

          {/* Variant Matrix Table */}
          {formData.variants && formData.variants.length > 0 && (
            <div style={{ overflowX: 'auto', border: '1px solid #EAE7E4', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F7F4F0', borderBottom: '1px solid #EAE7E4' }}>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>SKU</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Size</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Colour</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', width: '120px' }}>In Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.variants.map((v, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #EAE7E4' }}>
                      <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{v.sku}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{v.size}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{v.color}</td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                        <input
                          type="number"
                          min={0}
                          value={v.stock}
                          onChange={(e) => updateVariantStock(i, e.target.value)}
                          className="form-input"
                          style={{ padding: '4px', textAlign: 'center', fontSize: '0.85rem' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Visibility & Status */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #EAE7E4',
            borderRadius: '10px',
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Feature on Boutique Homepage</span>
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#5C5552' }}>Publishing Status:</span>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="form-select"
              style={{ width: 'auto', padding: '0.4rem 1.75rem 0.4rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="published">Published (Visible)</option>
              <option value="draft">Draft (Hidden)</option>
            </select>
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ padding: '0.85rem 2rem' }}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : isNew ? 'Create Garment' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
