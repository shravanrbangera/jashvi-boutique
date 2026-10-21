import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Boxes, AlertTriangle, Check, Search, Save, Loader2 } from 'lucide-react';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, low, out
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const { addToast } = useToast();

  const loadInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products?limit=100');
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
    loadInventory();
  }, []);

  const handleStockUpdate = async (productId, variantId, newStock) => {
    try {
      setUpdatingId(variantId);
      const res = await api.patch(`/products/${productId}/variants/${variantId}/stock`, {
        stock: newStock,
        reason: 'Admin Inventory Matrix Adjustment',
      });
      if (res.data?.success) {
        addToast('Stock updated successfully and recorded in audit log.', 'success');
        loadInventory();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Flatten products into variant rows
  const allVariantRows = [];
  products.forEach((p) => {
    p.variants?.forEach((v) => {
      allVariantRows.push({
        productId: p._id,
        productName: p.name,
        categoryName: p.category?.name || 'Ethnic Wear',
        image: p.images?.[0] || '/assets/images/purple-embroidered-kurti.jpg',
        variantId: v._id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        stock: v.stock,
        isAvailable: v.isAvailable,
      });
    });
  });

  const filteredVariants = allVariantRows.filter((row) => {
    if (filterType === 'low' && (row.stock > 3 || row.stock <= 0)) return false;
    if (filterType === 'out' && row.stock > 0) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        row.productName.toLowerCase().includes(q) ||
        row.sku.toLowerCase().includes(q) ||
        row.size.toLowerCase().includes(q) ||
        row.color.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C98491', fontWeight: 700 }}>
            Real-Time Stock Control
          </span>
          <h1 style={{ fontSize: '2rem', marginTop: '0.2rem' }}>Size & Colour Inventory Matrix</h1>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setFilterType('all')}
            className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Variants ({allVariantRows.length})
          </button>
          <button
            onClick={() => setFilterType('low')}
            className={`btn btn-sm ${filterType === 'low' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Low Stock (≤ 3)
          </button>
          <button
            onClick={() => setFilterType('out')}
            className={`btn btn-sm ${filterType === 'out' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Out of Stock (0)
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #EAE7E4',
          padding: '1rem',
          marginBottom: '1.5rem',
          maxWidth: '400px',
        }}
      >
        <input
          type="text"
          placeholder="Filter by garment, size, color, or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
        />
      </div>

      {/* Inventory Matrix Table */}
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
            <p>Loading inventory matrix...</p>
          </div>
        ) : filteredVariants.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#8A817D' }}>
            No variants found matching your criteria.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#FDFBF9', borderBottom: '1px solid #EAE7E4', color: '#5C5552' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Garment</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Variant SKU</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Size</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Colour</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Current Stock</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Quick Adjust</th>
                </tr>
              </thead>
              <tbody>
                {filteredVariants.map((row) => (
                  <tr key={row.variantId} style={{ borderBottom: '1px solid #EAE7E4' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={row.image}
                          alt={row.productName}
                          style={{ width: '38px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div>
                          <p style={{ fontWeight: 600, color: '#262322' }}>{row.productName}</p>
                          <p style={{ fontSize: '0.75rem', color: '#8A817D' }}>{row.categoryName}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5C5552' }}>
                      {row.sku}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700, color: '#C98491' }}>
                      {row.size}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {row.color}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <strong style={{ fontSize: '1.05rem', color: row.stock === 0 ? '#D32F2F' : row.stock <= 3 ? '#ED6C02' : '#262322' }}>
                        {row.stock}
                      </strong>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span className={`badge ${row.stock === 0 ? 'badge-error' : row.stock <= 3 ? 'badge-warning' : 'badge-success'}`}>
                        {row.stock === 0 ? 'Sold Out' : row.stock <= 3 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          onClick={() => handleStockUpdate(row.productId, row.variantId, Math.max(0, row.stock - 1))}
                          disabled={updatingId === row.variantId || row.stock <= 0}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleStockUpdate(row.productId, row.variantId, row.stock + 5)}
                          disabled={updatingId === row.variantId}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleStockUpdate(row.productId, row.variantId, row.stock + 10)}
                          disabled={updatingId === row.variantId}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                        >
                          +10
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
    </div>
  );
}
