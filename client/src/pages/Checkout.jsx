import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { formatINR } from '../utils/formatters';
import DevMockPaymentModal from '../components/DevMockPaymentModal';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Tag,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    addressLine: '',
    landmark: '',
    city: 'Mangalore',
    state: 'Karnataka',
    pincode: '575001',
    paymentMethod: 'ONLINE',
    notes: '',
  });

  // Delivery calculation state
  const [deliveryInfo, setDeliveryInfo] = useState({
    serviceable: true,
    deliveryCharge: 0,
    estimatedDays: '1 - 2 business days',
    message: '',
  });
  const [checkingPin, setCheckingPin] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Submission & Mock Payment Modal state
  const [submitting, setSubmitting] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);
  const [showMockModal, setShowMockModal] = useState(false);

  // Redirect to login if guest attempts checkout
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);

  // Pre-fill user default address if available
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setFormData((prev) => ({
        ...prev,
        fullName: def.fullName || user.name,
        phone: def.phone || user.phone,
        addressLine: def.addressLine || '',
        landmark: def.landmark || '',
        city: def.city || 'Mangalore',
        state: def.state || 'Karnataka',
        pincode: def.pincode || '575001',
      }));
      validatePincode(def.pincode || '575001');
    } else {
      validatePincode('575001');
    }
  }, [user]);

  const validatePincode = async (pin) => {
    if (!pin || pin.length !== 6) return;
    try {
      setCheckingPin(true);
      const res = await api.post('/delivery/check', { pincode: pin });
      if (res.data?.success) {
        setDeliveryInfo({
          serviceable: res.data.serviceable,
          deliveryCharge: res.data.deliveryCharge || 0,
          estimatedDays: res.data.estimatedDays || '2-4 business days',
          message: res.data.message || '',
        });
        if (res.data.city) {
          setFormData((prev) => ({ ...prev, city: res.data.city, state: res.data.state }));
        }
      }
    } catch (err) {
      setDeliveryInfo({
        serviceable: false,
        deliveryCharge: 0,
        estimatedDays: '',
        message: err.message,
      });
    } finally {
      setCheckingPin(false);
    }
  };

  const handlePincodeChange = (val) => {
    const cleanPin = val.replace(/\D/g, '').slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: cleanPin }));
    if (cleanPin.length === 6) {
      validatePincode(cleanPin);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setApplyingCoupon(true);
      const res = await api.post('/coupons/apply', {
        code: couponCode.trim(),
        subtotal: cart.subtotal,
      });
      if (res.data?.success) {
        setAppliedCoupon(res.data.coupon);
        addToast(res.data.message, 'success');
      }
    } catch (err) {
      addToast(err.message, 'error');
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const calculateFinalTotal = () => {
    const sub = cart.subtotal || 0;
    const disc = appliedCoupon ? appliedCoupon.discount : 0;
    const ship = deliveryInfo.serviceable ? deliveryInfo.deliveryCharge : 0;
    return Math.max(0, sub - disc + ship);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!deliveryInfo.serviceable) {
      addToast('Cannot checkout: Delivery is not serviceable to entered PIN code.', 'error');
      return;
    }

    if (!formData.addressLine || !formData.phone || !formData.fullName) {
      addToast('Please provide complete delivery details.', 'error');
      return;
    }

    try {
      setSubmitting(true);

      const orderPayload = {
        items: cart.items.map((i) => ({
          productId: i.product._id,
          variantSku: i.variantSku,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
        })),
        deliveryAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          addressLine: formData.addressLine,
          landmark: formData.landmark,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        paymentMethod: formData.paymentMethod,
        couponCode: appliedCoupon?.code,
        notes: formData.notes,
      };

      const res = await api.post('/orders', orderPayload);

      if (res.data?.success) {
        const createdOrder = res.data.order;

        if (formData.paymentMethod === 'ONLINE') {
          // If in dev mock mode, launch DevMockPaymentModal
          if (res.data.paymentGatewayOrder?.isMock) {
            setPendingOrderData({
              orderId: createdOrder.id,
              orderNumber: createdOrder.orderNumber,
              customerName: formData.fullName,
              amount: createdOrder.finalTotal,
            });
            setShowMockModal(true);
            setSubmitting(false);
            return;
          }
          // In production with Razorpay: Razorpay client script would trigger here
        }

        // For COD or direct confirmation
        clearCart();
        addToast('Order successfully confirmed!', 'success');
        navigate(`/order-confirmation/${createdOrder.id}`);
      }
    } catch (err) {
      addToast(err.message, 'error');
      setSubmitting(false);
    }
  };

  // Called when simulation in DevMockPaymentModal succeeds
  const handleMockPaymentSuccess = async ({ paymentId, signature }) => {
    try {
      setShowMockModal(false);
      setSubmitting(true);

      const res = await api.post('/payments/verify', {
        orderId: pendingOrderData.orderId,
        paymentId,
        signature,
      });

      if (res.data?.success) {
        clearCart();
        addToast('Online payment verified successfully! Order confirmed.', 'success');
        navigate(`/order-confirmation/${pendingOrderData.orderId}`);
      }
    } catch (err) {
      addToast(err.message, 'error');
      setSubmitting(false);
    }
  };

  const handleMockPaymentCancel = (reason) => {
    setShowMockModal(false);
    addToast(reason || 'Payment simulation cancelled.', 'info');
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Your bag is empty</h2>
        <p style={{ margin: '1rem 0' }}>Please add garments to your bag before proceeding to checkout.</p>
        <Link to="/products" className="btn btn-primary">Browse Collection</Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F7F4F0', padding: '2.5rem 0 4rem' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Secure Checkout</h1>

        <form onSubmit={handleSubmitOrder}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.6fr 1.1fr',
              gap: '2.5rem',
              alignItems: 'flex-start',
            }}
            className="checkout-layout"
          >
            {/* Left: Customer & Delivery Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Delivery Address Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EAE7E4',
                  borderRadius: '10px',
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <Truck size={20} color="#C98491" />
                  <h3 style={{ fontSize: '1.25rem' }}>Delivery Information</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="form-input"
                      placeholder="e.g. 9845012345"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address / House / Flat No. *</label>
                  <input
                    type="text"
                    required
                    value={formData.addressLine}
                    onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                    className="form-input"
                    placeholder="Apartment name, door number, street..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={formData.landmark}
                      onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                      className="form-input"
                      placeholder="Near Bloom Residency / KMC"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">PIN Code *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={formData.pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        className="form-input"
                        placeholder="6-digit PIN"
                      />
                      {checkingPin && (
                        <Loader2
                          size={16}
                          className="animate-spin"
                          style={{ position: 'absolute', right: 12, top: 12, color: '#C98491' }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Delivery Zone Serviceability Feedback */}
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  {deliveryInfo.serviceable ? (
                    <div style={{ color: '#2E7D32', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={16} />
                      <span>
                        Serviceable ({deliveryInfo.estimatedDays}) — Delivery fee:{' '}
                        <strong>{deliveryInfo.deliveryCharge === 0 ? 'FREE' : formatINR(deliveryInfo.deliveryCharge)}</strong>
                      </span>
                    </div>
                  ) : (
                    <div style={{ color: '#D32F2F', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertCircle size={16} />
                      <span>{deliveryInfo.message || 'Delivery is currently not available to this PIN code.'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method Selection Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EAE7E4',
                  borderRadius: '10px',
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <CreditCard size={20} color="#C98491" />
                  <h3 style={{ fontSize: '1.25rem' }}>Select Payment Method</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Option 1: Online */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: formData.paymentMethod === 'ONLINE' ? '2px solid #C98491' : '1px solid #EAE7E4',
                      backgroundColor: formData.paymentMethod === 'ONLINE' ? '#FDF8F9' : '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={formData.paymentMethod === 'ONLINE'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'ONLINE' })}
                    />
                    <CreditCard size={22} color="#C98491" />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#262322' }}>
                        Online Payment (UPI, Google Pay, Cards, NetBanking)
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#8A817D' }}>
                        Instant automated order confirmation via secure gateway
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Cash on Delivery */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: formData.paymentMethod === 'COD' ? '2px solid #C98491' : '1px solid #EAE7E4',
                      backgroundColor: formData.paymentMethod === 'COD' ? '#FDF8F9' : '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === 'COD'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                    />
                    <Banknote size={22} color="#C98491" />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#262322' }}>
                        Cash on Delivery (COD)
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#8A817D' }}>
                        Pay cash upon delivery to the courier partner
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className="form-group">
                <label className="form-label">Special Delivery / Fitting Instructions (Optional)</label>
                <textarea
                  className="form-textarea"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Ring the bell at gate / delivery timings / tailoring reference"
                  style={{ minHeight: '70px' }}
                />
              </div>
            </div>

            {/* Right: Order Summary & Pay Button */}
            <div>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EAE7E4',
                  borderRadius: '10px',
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'sticky',
                  top: '90px',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Bill Details</h3>

                {/* Items Mini List */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    marginBottom: '1.25rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid #EAE7E4',
                  }}
                >
                  {cart.items.map((i) => (
                    <div key={i._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <div style={{ maxWidth: '70%' }}>
                        <p style={{ fontWeight: 600, color: '#262322' }}>{i.product?.name}</p>
                        <p style={{ fontSize: '0.75rem', color: '#8A817D' }}>
                          Size: {i.size} | Qty: {i.quantity}
                        </p>
                      </div>
                      <span style={{ fontWeight: 600 }}>{formatINR(i.lineTotal)}</span>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Input */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. JASHVI10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="form-input"
                      style={{ textTransform: 'uppercase', fontSize: '0.85rem', padding: '0.55rem' }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="btn btn-secondary btn-sm"
                      disabled={applyingCoupon || !couponCode.trim()}
                    >
                      {applyingCoupon ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                    </button>
                  </div>

                  {appliedCoupon && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '0.5rem',
                        fontSize: '0.8rem',
                        color: '#2E7D32',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Tag size={13} /> {appliedCoupon.code} applied (-{formatINR(appliedCoupon.discount)})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode('');
                        }}
                        style={{ color: '#D32F2F', textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Bill Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#5C5552' }}>Product Subtotal:</span>
                    <span>{formatINR(cart.subtotal)}</span>
                  </div>

                  {appliedCoupon && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2E7D32' }}>
                      <span>Discount ({appliedCoupon.code}):</span>
                      <span>- {formatINR(appliedCoupon.discount)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#5C5552' }}>Delivery Fee:</span>
                    <span style={{ fontWeight: 600, color: deliveryInfo.deliveryCharge === 0 ? '#2E7D32' : '#262322' }}>
                      {deliveryInfo.deliveryCharge === 0 ? 'FREE' : formatINR(deliveryInfo.deliveryCharge)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8A817D', fontSize: '0.8rem' }}>
                    <span>Estimated Tax / GST:</span>
                    <span>Included in MRP</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: '0.85rem',
                      marginTop: '0.5rem',
                      borderTop: '2px solid #EAE7E4',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#262322',
                    }}
                  >
                    <span>Total Amount:</span>
                    <span style={{ color: '#C98491' }}>{formatINR(calculateFinalTotal())}</span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  disabled={submitting || !deliveryInfo.serviceable}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    marginTop: '1.5rem',
                    padding: '0.9rem',
                    fontSize: '1.05rem',
                    justifyContent: 'center',
                  }}
                >
                  {submitting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : formData.paymentMethod === 'ONLINE' ? (
                    <>
                      Proceed to Pay {formatINR(calculateFinalTotal())} <ArrowRight size={18} />
                    </>
                  ) : (
                    <>
                      Confirm Cash on Delivery Order <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    justifyContent: 'center',
                    marginTop: '1rem',
                    fontSize: '0.75rem',
                    color: '#8A817D',
                  }}
                >
                  <ShieldCheck size={14} color="#2E7D32" />
                  <span>Verified 256-Bit SSL Checkout • Boutique Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Development Mock Payment Simulation Modal */}
        <DevMockPaymentModal
          isOpen={showMockModal}
          orderDetails={pendingOrderData}
          onPaymentSuccess={handleMockPaymentSuccess}
          onPaymentCancel={handleMockPaymentCancel}
        />
      </div>
    </div>
  );
}
