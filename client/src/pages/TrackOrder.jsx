import React, { useState } from 'react';
import api from '../services/api';
import { formatDateTime } from '../utils/formatters';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Shield,
  Loader2,
} from 'lucide-react';

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setError('Please provide both your Order ID and the phone number used during checkout.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setTrackingInfo(null);

      const res = await api.post('/orders/track', {
        orderNumber: orderNumber.trim(),
        phone: phone.trim(),
      });

      if (res.data?.success) {
        setTrackingInfo(res.data.trackingInfo);
      }
    } catch (err) {
      setError(err.message || 'Tracking verification failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Placed', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

  const getStepIndex = (status) => {
    return steps.indexOf(status);
  };

  return (
    <div style={{ backgroundColor: '#F7F4F0', padding: '3rem 0 5rem', minHeight: '75vh' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C98491', fontWeight: 700 }}>
            Real-Time Updates
          </span>
          <h1 style={{ fontSize: '2.2rem', marginTop: '0.2rem' }}>Track Your Boutique Order</h1>
          <p style={{ color: '#5C5552', marginTop: '0.5rem' }}>
            Enter your order reference and registered phone number to verify and check fulfillment status.
          </p>
        </div>

        {/* Input Card */}
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
          <form onSubmit={handleTrack}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Order Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JB-2026-CJ3Q5Z"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  className="form-input"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#8A817D', marginBottom: '1.25rem' }}>
              <Shield size={14} color="#C98491" />
              <span>For customer privacy, private tracking is protected by phone number verification.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Search size={18} /> Track Order Progress</>}
            </button>
          </form>

          {error && (
            <div
              style={{
                marginTop: '1.25rem',
                backgroundColor: '#FFEBEE',
                color: '#D32F2F',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Tracking Results */}
        {trackingInfo && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #EAE7E4',
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #EAE7E4', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#8A817D', textTransform: 'uppercase' }}>Tracking Order</span>
                <h3 style={{ fontSize: '1.4rem' }}>{trackingInfo.orderNumber}</h3>
                <p style={{ fontSize: '0.85rem', color: '#5C5552' }}>
                  Destination: {trackingInfo.city}, {trackingInfo.state}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-rose" style={{ fontSize: '0.85rem', padding: '4px 10px' }}>
                  {trackingInfo.fulfillmentStatus}
                </span>
                <p style={{ fontSize: '0.8rem', color: '#8A817D', marginTop: '4px' }}>
                  Payment: <strong>{trackingInfo.paymentStatus}</strong> ({trackingInfo.paymentMethod})
                </p>
              </div>
            </div>

            {/* Courier Tracking Details */}
            {trackingInfo.trackingDetails?.trackingNumber && (
              <div
                style={{
                  backgroundColor: '#F7F4F0',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem',
                }}
              >
                <p>
                  <strong>Courier Partner:</strong> {trackingInfo.trackingDetails.courierPartner}
                </p>
                <p>
                  <strong>Tracking Airway Bill:</strong> {trackingInfo.trackingDetails.trackingNumber}
                </p>
                {trackingInfo.trackingDetails.estimatedDelivery && (
                  <p>
                    <strong>Estimated Arrival:</strong> {trackingInfo.trackingDetails.estimatedDelivery}
                  </p>
                )}
              </div>
            )}

            {/* Step Progress Line */}
            <h4 style={{ fontSize: '1.05rem', marginBottom: '1.25rem' }}>Fulfillment Timeline</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.5rem' }}>
              {trackingInfo.timeline?.map((evt, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1.5rem',
                      top: '4px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: idx === trackingInfo.timeline.length - 1 ? '#C98491' : '#262322',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <p style={{ fontWeight: 600, color: '#262322' }}>{evt.status}</p>
                    <span style={{ fontSize: '0.75rem', color: '#8A817D' }}>
                      {formatDateTime(evt.timestamp)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#5C5552', marginTop: '2px' }}>{evt.note}</p>
                </div>
              ))}
            </div>

            {/* Ordered Items Preview */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #EAE7E4' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Items in this consignment</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {trackingInfo.itemsPreview?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={item.image || '/assets/images/purple-embroidered-kurti.jpg'}
                      alt={item.name}
                      style={{ width: '48px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</p>
                      <p style={{ fontSize: '0.8rem', color: '#8A817D' }}>
                        Size: {item.size} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
