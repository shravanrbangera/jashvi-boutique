import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { formatINR } from '../utils/formatters';

export default function ProductCard({ product }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product._id);

  const mainImage = product.images && product.images.length > 0 ? product.images[0] : '/assets/images/purple-embroidered-kurti.jpg';
  const hasSale = product.salePrice && product.salePrice < product.regularPrice;
  const currentPrice = hasSale ? product.salePrice : product.regularPrice;
  const discountPercent = hasSale ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100) : 0;

  // Check total available stock across variants
  const totalStock = product.totalStock !== undefined ? product.totalStock : (product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 5);
  const isSoldOut = totalStock <= 0;

  return (
    <div className="product-card">
      <div className="product-image-container">
        <Link to={`/products/${product._id}`}>
          <img src={mainImage} alt={product.name} loading="lazy" />
        </Link>

        {/* Wishlist Button */}
        <button
          className={`product-wishlist-btn ${inWishlist ? 'active' : ''}`}
          onClick={() => toggleWishlist(product._id)}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={inWishlist ? '#C98491' : 'none'} color={inWishlist ? '#C98491' : '#262322'} />
        </button>

        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {isSoldOut ? (
            <span className="badge badge-error">Sold Out</span>
          ) : hasSale ? (
            <span className="badge badge-rose">{discountPercent}% OFF</span>
          ) : null}

          {product.isFeatured && !isSoldOut && (
            <span className="badge" style={{ backgroundColor: '#262322', color: '#fff' }}>Featured</span>
          )}
        </div>
      </div>

      <div className="product-card-body">
        <span className="product-card-category">
          {product.category?.name || product.productType || 'Ethnic Wear'}
        </span>

        <h3 className="product-card-title">
          <Link to={`/products/${product._id}`}>{product.name}</Link>
        </h3>

        {/* Available Sizes preview */}
        {product.sizes && product.sizes.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', margin: '0.4rem 0' }}>
            {product.sizes.slice(0, 4).map((sz) => (
              <span
                key={sz}
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 5px',
                  backgroundColor: '#F7F4F0',
                  border: '1px solid #EAE7E4',
                  borderRadius: '3px',
                  color: '#5C5552',
                }}
              >
                {sz}
              </span>
            ))}
            {product.sizes.length > 4 && (
              <span style={{ fontSize: '0.7rem', color: '#8A817D', alignSelf: 'center' }}>
                +{product.sizes.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="product-card-pricing">
          <span className="price-tag">{formatINR(currentPrice)}</span>
          {hasSale && <span className="price-original">{formatINR(product.regularPrice)}</span>}
        </div>
      </div>
    </div>
  );
}
