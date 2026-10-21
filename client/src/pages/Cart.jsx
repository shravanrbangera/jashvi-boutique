import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/formatters';
import { Trash2, ShoppingBag, ArrowRight, AlertTriangle, ShieldCheck, Truck } from 'lucide-react';

export default function Cart() {
  const { cart, updateQuantity, removeItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const freeDeliveryThreshold = 1999;
  const amountNeededForFree = Math.max(0, freeDeliveryThreshold - cart.subtotal);
  const progressPercent = Math.min(100, Math.round((cart.subtotal / freeDeliveryThreshold) * 100));

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div style={{ backgroundColor: '#F7F4F0', padding: '5rem 0', minHeight: '60vh' }}>
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
            <ShoppingBag size={36} color="#C98491" />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Your Shopping Bag is Empty</h2>
          <p style={{ color: '#5C5552', marginBottom: '2rem' }}>
            Discover our latest handcrafted kurtas, festive lehengas, and pure silk dress materials.
          </p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Explore Clothing Collection <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F7F4F0', padding: '2.5rem 0 4rem' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Shopping Bag ({cart.itemCount} items)</h1>

        {/* Free Shipping Progress Indicator */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #EAE7E4',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <Truck size={18} color="#C98491" />
            {amountNeededForFree === 0 ? (
              <span style={{ color: '#2E7D32', fontWeight: 600 }}>
                Congratulations! You qualify for complimentary boutique delivery in Mangalore!
              </span>
            ) : (
              <span>
                Add <strong>{formatINR(amountNeededForFree)}</strong> more to unlock <strong>FREE Boutique Delivery</strong>
              </span>
            )}
          </div>
          <div style={{ height: '6px', backgroundColor: '#EAE7E4', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                backgroundColor: '#C98491',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Stock Issues Notification if any */}
        {cart.hasStockIssues && (
          <div
            style={{
              backgroundColor: '#FFF3E0',
              border: '1px solid #FFE0B2',
              color: '#E65100',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <AlertTriangle size={18} />
            <span>
              One or more garments in your bag have limited stock. Quantities have been automatically adjusted.
            </span>
          </div>
        )}

        {/* Cart Grid Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '2rem',
            alignItems: 'flex-start',
          }}
          className="cart-layout"
        >
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cart.items.map((item) => (
              <div
                key={item._id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EAE7E4',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '90px',
                    height: '115px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    backgroundColor: '#EAE7E4',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={item.product?.image || '/assets/images/purple-embroidered-kurti.jpg'}
                    alt={item.product?.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: '#8A817D', textTransform: 'uppercase' }}>
                    {item.product?.category?.name || 'Ethnic Wear'}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', margin: '0.2rem 0 0.4rem' }}>
                    <Link to={`/products/${item.product?._id}`}>{item.product?.name}</Link>
                  </h3>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#5C5552', marginBottom: '0.5rem' }}>
                    <span>Size: <strong>{item.size}</strong></span>
                    <span>Colour: <strong>{item.color}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#262322' }}>
                      {formatINR(item.unitPrice)}
                    </span>
                    {item.regularPrice > item.unitPrice && (
                      <span style={{ textDecoration: 'line-through', color: '#8A817D', fontSize: '0.85rem' }}>
                        {formatINR(item.regularPrice)}
                      </span>
                    )}

                    {/* Quantity Selector */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #EAE7E4',
                        borderRadius: '4px',
                        marginLeft: 'auto',
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        style={{ padding: '4px 8px', cursor: 'pointer' }}
                      >
                        -
                      </button>
                      <span style={{ padding: '0 8px', fontSize: '0.9rem', fontWeight: 600 }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        style={{ padding: '4px 8px', cursor: 'pointer' }}
                        disabled={item.quantity >= item.currentStock}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item._id)}
                      style={{ color: '#8A817D', cursor: 'pointer', padding: '4px' }}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #EAE7E4',
              borderRadius: '10px',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Order Summary</h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              <span style={{ color: '#5C5552' }}>Bag Subtotal:</span>
              <span style={{ fontWeight: 600 }}>{formatINR(cart.subtotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              <span style={{ color: '#5C5552' }}>Estimated Delivery:</span>
              <span style={{ color: amountNeededForFree === 0 ? '#2E7D32' : '#5C5552', fontWeight: 600 }}>
                {amountNeededForFree === 0 ? 'FREE' : 'Calculated at Checkout'}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid #EAE7E4',
                marginTop: '1rem',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: '#262322',
              }}
            >
              <span>Subtotal:</span>
              <span>{formatINR(cart.subtotal)}</span>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#8A817D', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Applicable delivery zone charges and promotional discounts are finalized at checkout.
            </p>

            <button
              onClick={handleCheckoutClick}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem', justifyContent: 'center' }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            {!isAuthenticated && (
              <p style={{ fontSize: '0.8rem', color: '#C98491', textAlign: 'center', marginTop: '0.75rem' }}>
                Note: You will be prompted to log in or register before completing purchase.
              </p>
            )}

            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #EAE7E4',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: '#5C5552',
              }}
            >
              <ShieldCheck size={16} color="#2E7D32" />
              <span>Safe & Secure Checkout • Encrypted Transactions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
