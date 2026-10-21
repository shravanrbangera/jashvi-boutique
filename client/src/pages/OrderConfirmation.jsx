import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { formatINR } from '../utils/formatters';
import { CheckCircle2, Package, FileText, ArrowRight, Printer, MapPin, Truck } from 'lucide-react';

export default function OrderConfirmation() {
  const { id, orderNumber } = useParams();
  const targetId = id || orderNumber;
  const [order, setOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!targetId || targetId === 'undefined') {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/orders/${targetId}`);
        if (res.data?.success) {
          setOrder(res.data.order);
          setInvoice(res.data.invoice);
        }
      } catch (err) {
        console.warn('Failed to load confirmed order:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [targetId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem 0' }}>Loading order confirmation...</div>;
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Order Confirmation</h2>
        <p style={{ margin: '1rem 0' }}>Order details are being synchronized.</p>
        <Link to="/" className="btn btn-primary">Return to Home</Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F7F4F0', padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        {/* Success Header */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #EAE7E4',
            padding: '2.5rem',
            textAlign: 'center',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: '#E8F5E9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <CheckCircle2 size={36} color="#2E7D32" />
          </div>

          <span
            style={{
              backgroundColor: order.fulfillmentStatus === 'Placed' ? '#FEF3C7' : '#F1DFE2',
              color: order.fulfillmentStatus === 'Placed' ? '#B45309' : '#A86472',
              border: order.fulfillmentStatus === 'Placed' ? '1px solid #FCD34D' : 'none',
              padding: '4px 14px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            {order.fulfillmentStatus === 'Placed' ? 'ORDER PLACED • PENDING ADMIN CONFIRMATION' : `ORDER ${order.fulfillmentStatus?.toUpperCase()}`}
          </span>

          <h1 style={{ fontSize: '2rem', margin: '0.5rem 0 0.5rem' }}>
            Thank You, {order.user?.name}!
          </h1>
          <p style={{ color: '#5C5552', fontSize: '1rem', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
            {order.fulfillmentStatus === 'Placed'
              ? 'Your order has been placed successfully and is awaiting review and confirmation by the boutique administrator.'
              : 'Your order has been officially confirmed by our boutique team in Attavara, Mangalore.'}
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1rem',
              backgroundColor: '#FDFBF9',
              border: '1px dashed #C98491',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
            }}
          >
            <span style={{ color: '#5C5552', fontSize: '0.9rem' }}>Order Number:</span>
            <strong style={{ fontSize: '1.15rem', color: '#262322' }}>{order.orderNumber}</strong>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/invoices/${order.orderNumber}`} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} /> Download Bill / Invoice
            </Link>
            <Link to="/orders" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Package size={16} /> My Orders History
            </Link>
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #EAE7E4',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid #EAE7E4', paddingBottom: '0.75rem' }}>
            Order Snapshot
          </h3>

          {/* Delivery Address & Payment Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#8A817D', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Delivery Address
              </p>
              <p style={{ fontWeight: 600 }}>{order.deliveryAddress?.fullName}</p>
              <p style={{ color: '#5C5552', fontSize: '0.9rem' }}>
                {order.deliveryAddress?.addressLine}<br />
                {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}<br />
                Phone: {order.deliveryAddress?.phone}
              </p>
            </div>

            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#8A817D', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Payment Status
              </p>
              <p style={{ fontWeight: 600 }}>Method: {order.payment?.method === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>
                Status:{' '}
                <span className={`badge ${order.payment?.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                  {order.payment?.status}
                </span>
                {order.payment?.isMock && (
                  <span style={{ fontSize: '0.75rem', color: '#ED6C02', display: 'block', marginTop: '2px' }}>
                    [DEV MOCK PAYMENT SANDBOX]
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #EAE7E4', paddingTop: '1.5rem' }}>
            {order.items?.map((item) => (
              <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img
                  src={item.image || '/assets/images/purple-embroidered-kurti.jpg'}
                  alt={item.name}
                  style={{ width: '60px', height: '75px', objectFit: 'cover', borderRadius: '4px' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</p>
                  <p style={{ fontSize: '0.8rem', color: '#8A817D' }}>
                    Size: {item.size} | Colour: {item.color} | Qty: {item.quantity}
                  </p>
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{formatINR(item.lineTotal)}</span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #EAE7E4',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.9rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#5C5552' }}>Subtotal:</span>
              <span>{formatINR(order.pricing?.subtotal)}</span>
            </div>
            {order.pricing?.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2E7D32' }}>
                <span>Discount ({order.pricing?.couponCode}):</span>
                <span>- {formatINR(order.pricing?.discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#5C5552' }}>Delivery Charge:</span>
              <span>{order.pricing?.deliveryCharge === 0 ? 'FREE' : formatINR(order.pricing?.deliveryCharge)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.2rem',
                fontWeight: 700,
                marginTop: '0.5rem',
                paddingTop: '0.5rem',
                borderTop: '2px solid #EAE7E4',
              }}
            >
              <span>Total Paid / Payable:</span>
              <span style={{ color: '#C98491' }}>{formatINR(order.pricing?.finalTotal)}</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link to="/products" className="btn btn-secondary">
            Continue Shopping Boutique Clothing <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
