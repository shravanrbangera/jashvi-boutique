import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, Search, X, Loader2 } from 'lucide-react';

export default function AllProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter state
  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const selectedSize = searchParams.get('size') || '';
  const selectedColor = searchParams.get('color') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortBy = searchParams.get('sort') || 'newest';

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory) params.set('categorySlug', selectedCategory);
      if (selectedSize) params.set('size', selectedSize);
      if (selectedColor) params.set('color', selectedColor);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (sortBy) params.set('sort', sortBy);

      const res = await api.get(`/products?${params.toString()}`);
      if (res.data?.success) {
        setProducts(res.data.products);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.warn('Failed to load products:', err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedSize, selectedColor, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get('/products/categories');
        if (res.data?.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.warn('Failed to load categories:', err.message);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const sizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Semi-Stitched', 'Unstitched Fabric Set'];
  const colorsList = ['Royal Purple', 'Ivory White', 'Midnight Blue', 'Ivory & Mauve', 'Emerald Green', 'Mustard Gold'];

  return (
    <div style={{ backgroundColor: '#F7F4F0', padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C98491', fontWeight: 700 }}>
            Catalogue
          </span>
          <h1 style={{ fontSize: '2.2rem', marginTop: '0.2rem' }}>
            {selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.name || 'Clothing Collection'
              : 'All Boutique Clothing'}
          </h1>
          <p style={{ color: '#5C5552', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Showing {products.length} of {totalCount} curated styles in Indian ethnic fashion
          </p>
        </div>

        {/* Category Tabs for Fast Browsing */}
        <div
          style={{
            display: 'flex',
            gap: '0.6rem',
            overflowX: 'auto',
            paddingBottom: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <button
            onClick={() => updateParam('category', '')}
            className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '20px' }}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => updateParam('category', cat.slug)}
              className={`btn btn-sm ${selectedCategory === cat.slug ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '20px', whiteSpace: 'nowrap' }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Toolbar: Filters toggle & Sort by */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <SlidersHorizontal size={16} /> Filter Products
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#5C5552' }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 1.75rem 0.45rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Filter Drawer / Accordion */}
        {mobileFilterOpen && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #EAE7E4',
              borderRadius: '10px',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem' }}>Refine Clothing</h3>
              <button
                onClick={clearAllFilters}
                style={{ fontSize: '0.8rem', color: '#C98491', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Reset All Filters
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {/* Size Filter */}
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Size</p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {sizesList.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => updateParam('size', selectedSize === sz ? '' : sz)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.8rem',
                        border: '1px solid #EAE7E4',
                        borderRadius: '4px',
                        backgroundColor: selectedSize === sz ? '#262322' : '#FDFBF9',
                        color: selectedSize === sz ? '#FFFFFF' : '#262322',
                        cursor: 'pointer',
                      }}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Colour Palette</p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {colorsList.map((cl) => (
                    <button
                      key={cl}
                      onClick={() => updateParam('color', selectedColor === cl ? '' : cl)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.8rem',
                        border: '1px solid #EAE7E4',
                        borderRadius: '4px',
                        backgroundColor: selectedColor === cl ? '#C98491' : '#FDFBF9',
                        color: selectedColor === cl ? '#FFFFFF' : '#262322',
                        cursor: 'pointer',
                      }}
                    >
                      {cl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Price Range (₹)</p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={minPrice}
                    onChange={(e) => updateParam('minPrice', e.target.value)}
                    className="form-input"
                    style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                  />
                  <span>–</span>
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={maxPrice}
                    onChange={(e) => updateParam('maxPrice', e.target.value)}
                    className="form-input"
                    style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Loader2 size={32} className="animate-spin" color="#C98491" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: '#5C5552' }}>Loading clothing catalogue...</p>
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #EAE7E4',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No garments matched your filters</h3>
            <p style={{ color: '#5C5552', marginBottom: '1.5rem' }}>
              Try clearing selected sizes, categories, or price ranges to see other clothing.
            </p>
            <button onClick={clearAllFilters} className="btn btn-primary">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
