import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { formatINR, formatDate, formatDateTime } from '../utils/formatters';
import {
  Package,
  FileText,
  RotateCcw,
  ArrowLeft,
  Truck,
  MapPin,
  Clock,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${id}`);
        if (res.data?.success) {
          setOrder(res.data.order);
          setInvoice(res.data.invoice);
        }
      } catch (err) {
        console.warn('Failed to load order details:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <Loader2 size={32} className="animate-spin" color="#C98491" style={{ margin: '0 auto 1rem' }} />
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Order Not Found</h2>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Orders
        </Link>
      </div>
    );
  }

  const isDelivered = order.fulfillmentStatus === 'Delivered';

  return (
    <div style={{ backgroundColor: '#F7F4F0', padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        <Link
          to="/orders"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#5C5552', marginBottom: '1.5rem', fontSize: '0.9rem' }}
        >
          <ArrowLeft size={16} /> Back to My Orders
        </Link>

        {/* Top Header Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #EAE7E4',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#8A817D', textTransform: 'uppercase' }}>
                Order Summary
              </span>
              <h1 style={{ fontSize: '1.85rem', margin: '0.2rem 0' }}>{order.orderNumber}</h1>
              <p style={{ fontSize: '0.85rem', color: '#5C5552' }}>
                Placed on: {formatDateTime(order.createdAt)}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to={`/invoices/${order.orderNumber}`} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <FileText size={16} /> Download Bill / Invoice
              </Link>

              {isDelivered && (
                <Link to={`/returns/request/${order._id}`} className="btn btn-primary btn-sm">
                  <RotateCcw size={16} /> Request Return
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Fulfillment Timeline */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #EAE7E4',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #EAE7E4', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Order Timeline</h3>
            <span className="badge badge-rose">{order.fulfillmentStatus}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingLeft: '1.5rem', position: 'relative' }}>
            {order.timeline?.map((evt, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-1.5rem',
                    top: '4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: idx === order.timeline.length - 1 ? '#C98491' : '#262322',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '0.95rem' }}>{evt.status}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#8A817D' }}>
                    {formatDateTime(evt.timestamp)}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#5C5552', marginTop: '2px' }}>{evt.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ordered Items & Snapshot Details */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #EAE7E4',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', borderBottom: '1px solid #EAE7E4', paddingBottom: '0.75rem' }}>
            Consignment Items ({order.items?.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {order.items?.map((item) => (
              <div key={item._id} style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <img
                  src={item.image || '/assets/images/purple-embroidered-kurti.jpg'}
                  alt={item.name}
                  style={{ width: '64px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{item.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#5C5552' }}>
                    SKU: {item.sku} | Size: {item.size} | Colour: {item.color}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#8A817D' }}>
                    Qty: {item.quantity} × {formatINR(item.unitPrice)}
                  </p>
                </div>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{formatINR(item.lineTotal)}</span>
              </div>
            ))}
          </div>

          {/* Delivery & Pricing Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', borderTop: '1px solid #EAE7E4', paddingTop: '1.5rem' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', color: '#8A817D', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Delivery Destination
              </h4>
              <p style={{ fontWeight: 600 }}>{order.deliveryAddress?.fullName}</p>
              <p style={{ color: '#5C5552', fontSize: '0.9rem' }}>
                {order.deliveryAddress?.addressLine}<br />
                {order.deliveryAddress?.landmark && <>{order.deliveryAddress.landmark}<br /></>}
                {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - <strong>{order.deliveryAddress?.pincode}</strong><br />
                Phone: {order.deliveryAddress?.phone}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', color: '#8A817D', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Payment & Price Breakdown
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>{formatINR(order.pricing?.subtotal)}</span>
                </div>
                {order.pricing?.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2E7D32' }}>
                    <span>Discount:</span>
                    <span>- {formatINR(order.pricing?.discount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Delivery Charge:</span>
                  <span>{order.pricing?.deliveryCharge === 0 ? 'FREE' : formatINR(order.pricing?.deliveryCharge)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    borderTop: '1px solid #EAE7E4',
                    paddingTop: '0.5rem',
                    marginTop: '0.25rem',
                  }}
                >
                  <span>Total Amount:</span>
                  <span style={{ color: '#C98491' }}>{formatINR(order.pricing?.finalTotal)}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#8A817D', marginTop: '0.5rem' }}>
                  Method: {order.payment?.method} | Status: {order.payment?.status}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
