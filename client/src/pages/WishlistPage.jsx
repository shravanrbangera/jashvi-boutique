import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/formatters';
import { Heart, ShoppingBag, Trash2, ArrowRight, Loader2 } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistItems, toggleWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleMoveToCart = async (product) => {
    const size = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Free Size';
    const color = product.colors && product.colors.length > 0 ? product.colors[0] : 'Standard';
    const res = await addToCart(product._id, size, color, 1);
    if (res?.success) {
      toggleWishlist(product._id);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#F7F4F0', padding: '5rem 0', minHeight: '65vh' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '520px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#F1DFE2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <Heart size={36} color="#C98491" />
          </div>
          <h2 style={{ fontSize: '1.85rem', marginBottom: '0.75rem' }}>Your Boutique Wishlist</h2>
          <p style={{ color: '#5C5552', marginBottom: '2rem' }}>
            Please log in or create an account to save your favorite garments and view them on any device.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login?redirect=/wishlist" className="btn btn-primary">
              Log In to Wishlist
            </Link>
            <Link to="/register?redirect=/wishlist" className="btn btn-secondary">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <Loader2 size={32} className="animate-spin" color="#C98491" style={{ margin: '0 auto 1rem' }} />
        <p>Loading your saved pieces...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F7F4F0', padding: '3rem 0 5rem', minHeight: '75vh' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C98491', fontWeight: 700 }}>
              Saved Styles
            </span>
            <h1 style={{ fontSize: '2.2rem', marginTop: '0.2rem' }}>My Wishlist ({wishlistItems.length})</h1>
          </div>
          <Link to="/products" className="btn btn-secondary btn-sm">
            Continue Browsing
          </Link>
        </div>

        {wishlistItems.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #EAE7E4',
              padding: '4rem 1.5rem',
              textAlign: 'center',
              maxWidth: '520px',
              margin: '0 auto',
            }}
          >
            <Heart size={40} color="#C98491" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Your Wishlist is Empty</h3>
            <p style={{ color: '#5C5552', marginBottom: '1.5rem' }}>
              Explore our designer kurtas, festive lehengas, and dress materials and click the heart icon to save your favorites.
            </p>
            <Link to="/products" className="btn btn-primary">
              Explore Clothing Collection <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {wishlistItems.map((product) => {
              const mainImage = product.images?.[0] || '/assets/images/purple-embroidered-kurti.jpg';
              const price = product.salePrice && product.salePrice < product.regularPrice ? product.salePrice : product.regularPrice;

              return (
                <div
                  key={product._id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    border: '1px solid #EAE7E4',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ position: 'relative', aspectRatio: '3/4', backgroundColor: '#EAE7E4' }}>
                    <Link to={`/products/${product._id}`}>
                      <img src={mainImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Link>
                    <button
                      onClick={() => toggleWishlist(product._id)}
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        backgroundColor: '#FFFFFF',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      }}
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} color="#D32F2F" />
                    </button>
                  </div>

                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#8A817D' }}>
                      {product.category?.name || 'Ethnic Wear'}
                    </span>
                    <h3 style={{ fontSize: '0.95rem', margin: '0.25rem 0 0.5rem', fontWeight: 600 }}>
                      <Link to={`/products/${product._id}`}>{product.name}</Link>
                    </h3>

                    <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                      <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#262322', marginBottom: '0.75rem' }}>
                        {formatINR(price)}
                      </p>

                      <button
                        onClick={() => handleMoveToCart(product)}
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <ShoppingBag size={15} /> Move to Bag
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
