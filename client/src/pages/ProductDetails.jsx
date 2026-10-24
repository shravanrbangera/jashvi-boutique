import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/formatters';
import SizeGuideModal from '../components/SizeGuideModal';
import PincodeChecker from '../components/PincodeChecker';
import ProductCard from '../components/ProductCard';
import {
  Heart,
  ShoppingBag,
  Zap,
  Ruler,
  Check,
  AlertCircle,
  Truck,
  RotateCcw,
  ShieldCheck,
  Scissors,
  Loader2,
} from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('fabric');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        if (res.data?.success) {
          const prod = res.data.product;
          setProduct(prod);
          setSelectedImage(prod.images && prod.images.length > 0 ? prod.images[0] : '');

          // Default selected size and color
          if (prod.sizes && prod.sizes.length > 0) {
            setSelectedSize(prod.sizes[0]);
          }
          if (prod.colors && prod.colors.length > 0) {
            setSelectedColor(prod.colors[0]);
          }

          // Fetch related products in same category
          if (prod.category?._id) {
            api
              .get(`/products?category=${prod.category._id}&limit=4`)
              .then((r) => {
                if (r.data?.success) {
                  setRelatedProducts(r.data.products.filter((p) => p._id !== prod._id));
                }
              })
              .catch(() => {});
          }
        }
      } catch (err) {
        addToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, addToast]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <Loader2 size={36} className="animate-spin" color="#C98491" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: '#5C5552' }}>Loading clothing details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Garment Not Found</h2>
        <p style={{ margin: '1rem 0' }}>This item might have been archived or removed from the boutique collection.</p>
        <Link to="/products" className="btn btn-primary">
          Browse Available Clothing
        </Link>
      </div>
    );
  }

  // Active variant determination
  const activeVariant =
    product.variants?.find((v) => v.size === selectedSize && v.color === selectedColor) ||
    product.variants?.find((v) => v.size === selectedSize) ||
    product.variants?.[0];

  const currentStock = activeVariant ? activeVariant.stock : 0;
  const isOutOfStock = currentStock <= 0;
  const hasSale = product.salePrice && product.salePrice < product.regularPrice;
  const currentPrice = hasSale ? product.salePrice : product.regularPrice;
  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      addToast('Please select your clothing size.', 'info');
      return;
    }
    if (isOutOfStock) {
      addToast('This size/colour variant is currently sold out.', 'error');
      return;
    }

    setAddingToCart(true);
    const result = await addToCart(product._id, selectedSize, selectedColor || 'Standard', quantity);
    setAddingToCart(false);
    return result;
  };

  const handleBuyNow = async () => {
    const result = await handleAddToCart();
    if (result?.success) {
      navigate('/checkout');
    }
  };

  return (
    <div style={{ backgroundColor: '#FDFBF9', padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Breadcrumbs */}
        <div style={{ fontSize: '0.85rem', color: '#8A817D', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ color: '#5C5552' }}>Home</Link> /{' '}
          <Link to="/products" style={{ color: '#5C5552' }}>Clothing</Link> /{' '}
          <Link to={`/products?category=${product.category?.slug}`} style={{ color: '#5C5552' }}>
            {product.category?.name || 'Ethnic Wear'}
          </Link> /{' '}
          <span style={{ color: '#262322' }}>{product.name}</span>
        </div>

        {/* Product Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3.5rem',
            alignItems: 'flex-start',
          }}
          className="product-detail-layout"
        >
          {/* Left: Gallery */}
          <div>
            <div
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#EAE7E4',
                aspectRatio: '3/4',
                boxShadow: 'var(--shadow-md)',
                position: 'relative',
              }}
            >
              <img
                src={selectedImage || product.images?.[0] || '/assets/images/purple-embroidered-kurti.jpg'}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  const currentSrc = selectedImage || product.images?.[0] || '';
                  const filename = currentSrc.split('/').pop();
                  if (filename && !e.target.src.includes('/assets/images/')) {
                    e.target.src = `/assets/images/${filename}`;
                  } else {
                    e.target.src = '/assets/images/purple-embroidered-kurti.jpg';
                  }
                }}
              />

              {hasSale && (
                <span
                  className="badge badge-rose"
                  style={{ position: 'absolute', top: 15, left: 15, fontSize: '0.85rem', padding: '4px 10px' }}
                >
                  {Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Strip */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', overflowX: 'auto' }}>
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      width: '74px',
                      height: '92px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: selectedImage === img ? '2px solid #C98491' : '1px solid #EAE7E4',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={img}
                      alt={`View ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        const filename = img ? img.split('/').pop() : '';
                        if (filename && !e.target.src.includes('/assets/images/')) {
                          e.target.src = `/assets/images/${filename}`;
                        } else {
                          e.target.src = '/assets/images/purple-embroidered-kurti.jpg';
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Purchase Controls */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8A817D' }}>
                  SKU: {product.sku}
                </span>
                <h1 style={{ fontSize: '2rem', marginTop: '0.2rem', marginBottom: '0.5rem' }}>
                  {product.name}
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#5C5552' }}>
                  Product Type: <strong>{product.productType}</strong>
                </p>
              </div>

              <button
                onClick={() => toggleWishlist(product._id)}
                className="nav-icon-btn"
                style={{
                  border: '1px solid #EAE7E4',
                  backgroundColor: '#FFFFFF',
                  width: '42px',
                  height: '42px',
                  justifyContent: 'center',
                }}
                aria-label="Wishlist"
              >
                <Heart size={20} fill={inWishlist ? '#C98491' : 'none'} color={inWishlist ? '#C98491' : '#262322'} />
              </button>
            </div>

            {/* Price Display */}
            <div style={{ margin: '1.25rem 0', display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.85rem', fontWeight: 700, color: '#262322' }}>
                {formatINR(currentPrice)}
              </span>
              {hasSale && (
                <span style={{ textDecoration: 'line-through', color: '#8A817D', fontSize: '1.1rem' }}>
                  {formatINR(product.regularPrice)}
                </span>
              )}
              <span style={{ fontSize: '0.8rem', color: '#5C5552' }}>(Inclusive of all boutique taxes)</span>
            </div>

            <p style={{ color: '#5C5552', lineHeight: '1.7', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
              {product.description}
            </p>

            {/* Size Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  Select Size: <span style={{ color: '#C98491' }}>{selectedSize}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#C98491', fontWeight: 600, cursor: 'pointer' }}
                >
                  <Ruler size={14} /> Size Guide
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {product.sizes?.map((sz) => {
                  const variantForSize = product.variants?.find((v) => v.size === sz && v.color === selectedColor);
                  const isSzOut = variantForSize ? variantForSize.stock <= 0 : false;

                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      disabled={isSzOut}
                      style={{
                        padding: '0.65rem 1.15rem',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: selectedSize === sz ? '2px solid #262322' : '1px solid #EAE7E4',
                        backgroundColor: selectedSize === sz ? '#262322' : isSzOut ? '#F5F5F5' : '#FFFFFF',
                        color: selectedSize === sz ? '#FFFFFF' : isSzOut ? '#BDBDBD' : '#262322',
                        cursor: isSzOut ? 'not-allowed' : 'pointer',
                        position: 'relative',
                        textDecoration: isSzOut ? 'line-through' : 'none',
                      }}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colour Selector */}
            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Colour: <span style={{ color: '#5C5552' }}>{selectedColor}</span>
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.colors.map((cl) => (
                    <button
                      key={cl}
                      onClick={() => setSelectedColor(cl)}
                      style={{
                        padding: '0.45rem 0.9rem',
                        fontSize: '0.85rem',
                        borderRadius: '6px',
                        border: selectedColor === cl ? '2px solid #C98491' : '1px solid #EAE7E4',
                        backgroundColor: selectedColor === cl ? '#F1DFE2' : '#FFFFFF',
                        color: '#262322',
                        cursor: 'pointer',
                      }}
                    >
                      {cl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Availability Indicator */}
            <div style={{ marginBottom: '1.5rem' }}>
              {isOutOfStock ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#D32F2F', fontSize: '0.875rem', fontWeight: 600 }}>
                  <AlertCircle size={16} /> Sold Out in {selectedSize} ({selectedColor})
                </div>
              ) : currentStock <= 3 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ED6C02', fontSize: '0.875rem', fontWeight: 600 }}>
                  <AlertCircle size={16} /> Only {currentStock} left in stock — order soon!
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2E7D32', fontSize: '0.875rem', fontWeight: 600 }}>
                  <Check size={16} /> In Stock ({currentStock} available in Attavara)
                </div>
              )}
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #EAE7E4',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '0.75rem 1rem', fontSize: '1rem', cursor: 'pointer' }}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  -
                </button>
                <span style={{ padding: '0 0.75rem', fontWeight: 600 }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  style={{ padding: '0.75rem 1rem', fontSize: '1rem', cursor: 'pointer' }}
                  disabled={quantity >= currentStock || isOutOfStock}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className="btn btn-secondary"
                style={{ flex: 1, minWidth: '160px' }}
              >
                {addingToCart ? <Loader2 size={18} className="animate-spin" /> : <><ShoppingBag size={18} /> Add to Bag</>}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock || addingToCart}
                className="btn btn-primary"
                style={{ flex: 1, minWidth: '160px' }}
              >
                <Zap size={18} color="#C5A059" /> Buy Now
              </button>
            </div>

            {/* PIN Code Delivery Checker */}
            <PincodeChecker />

            {/* Tabs for Fabric, Care & Boutique Tailoring */}
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #EAE7E4', gap: '1.5rem' }}>
                <button
                  onClick={() => setActiveTab('fabric')}
                  style={{
                    padding: '0.75rem 0',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    borderBottom: activeTab === 'fabric' ? '2px solid #C98491' : 'none',
                    color: activeTab === 'fabric' ? '#C98491' : '#5C5552',
                    cursor: 'pointer',
                  }}
                >
                  Fabric & Care
                </button>
                <button
                  onClick={() => setActiveTab('tailoring')}
                  style={{
                    padding: '0.75rem 0',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    borderBottom: activeTab === 'tailoring' ? '2px solid #C98491' : 'none',
                    color: activeTab === 'tailoring' ? '#C98491' : '#5C5552',
                    cursor: 'pointer',
                  }}
                >
                  In-Store Customization
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  style={{
                    padding: '0.75rem 0',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    borderBottom: activeTab === 'shipping' ? '2px solid #C98491' : 'none',
                    color: activeTab === 'shipping' ? '#C98491' : '#5C5552',
                    cursor: 'pointer',
                  }}
                >
                  Shipping & Returns
                </button>
              </div>

              <div style={{ padding: '1.25rem 0', fontSize: '0.9rem', color: '#5C5552', lineHeight: '1.7' }}>
                {activeTab === 'fabric' && (
                  <div>
                    <p><strong>Fabric / Material:</strong> {product.fabric}</p>
                    <p style={{ marginTop: '0.5rem' }}><strong>Care Instructions:</strong> {product.care}</p>
                  </div>
                )}
                {activeTab === 'tailoring' && (
                  <div>
                    <p>
                      <strong>Need this tailored to your measurements?</strong><br />
                      Visit our Attavara atelier in Mangalore for personalized neckline adjustments, sleeve alterations, or custom blouse stitching. Contact our boutique at <strong>8050853393</strong>.
                    </p>
                  </div>
                )}
                {activeTab === 'shipping' && (
                  <div>
                    <p>
                      • <strong>Mangalore Delivery:</strong> Same-day or 1-2 business days.<br />
                      • <strong>Rest of India:</strong> 2 - 5 business days.<br />
                      • <strong>Returns:</strong> 7-day return request window for unworn ready-made clothing with intact tags.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid #EAE7E4' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              Complete the Look / You May Also Love
            </h2>
            <div className="product-grid">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel._id} product={rel} />
              ))}
            </div>
          </div>
        )}

        {/* Size Guide Modal */}
        <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
      </div>
    </div>
  );
}
