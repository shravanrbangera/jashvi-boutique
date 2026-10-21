import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { formatINR, formatDateTime } from '../utils/formatters';
import { RotateCcw, CheckCircle2, Clock, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

export default function ReturnStatusPage() {
  const { returnNumber } = useParams();
  const [returnReq, setReturnReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadReturn() {
      try {
        setLoading(true);
        const res = await api.get(`/returns/track/${returnNumber}`);
        if (res.data?.success) {
          setReturnReq(res.data.returnRequest);
        }
      } catch (err) {
        setError(err.message || 'Return record not found');
      } finally {
        setLoading(false);
      }
    }
    loadReturn();
  }, [returnNumber]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '6rem 0' }}>Loading return tracking details...</div>;
  }

  if (error || !returnReq) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Return Request Not Found</h2>
        <p style={{ color: '#D32F2F', margin: '1rem 0' }}>{error}</p>
        <Link to="/orders" className="btn btn-primary">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F7F4F0', padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '750px' }}>
        <Link
          to="/orders"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#5C5552', marginBottom: '1.5rem', fontSize: '0.9rem' }}
        >
          <ArrowLeft size={16} /> Back to My Orders
        </Link>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #EAE7E4',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #EAE7E4', paddingBottom: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#8A817D', textTransform: 'uppercase' }}>
                Boutique Return Docket
              </span>
              <h1 style={{ fontSize: '1.75rem', marginTop: '0.2rem' }}>{returnReq.returnNumber}</h1>
              <p style={{ fontSize: '0.85rem', color: '#5C5552' }}>
                Order Ref: <strong>{returnReq.orderNumber}</strong> • Submitted: {formatDateTime(returnReq.createdAt)}
              </p>
            </div>

            <span
              className={`badge ${
                returnReq.status === 'Refunded'
                  ? 'badge-success'
                  : returnReq.status === 'Rejected'
                  ? 'badge-error'
                  : 'badge-rose'
              }`}
              style={{ fontSize: '0.85rem', padding: '5px 12px' }}
            >
              {returnReq.status}
            </span>
          </div>

          {/* Refund Details if processed */}
          {returnReq.refundDetails && returnReq.refundDetails.method !== 'NONE' && (
            <div
              style={{
                backgroundColor: '#E8F5E9',
                border: '1px solid #C8E6C9',
                borderRadius: '8px',
                padding: '1.25rem',
                marginBottom: '1.75rem',
                color: '#2E7D32',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>
                <CheckCircle2 size={18} /> Refund Disbursed & Confirmed
              </div>
              <p style={{ fontSize: '0.9rem', color: '#1B5E20' }}>
                Amount: <strong>{formatINR(returnReq.refundDetails.amount)}</strong><br />
                Method: <strong>{returnReq.refundDetails.method}</strong><br />
                Transaction Ref: <strong>{returnReq.refundDetails.transactionReference}</strong><br />
                Processed on: {formatDateTime(returnReq.refundDetails.processedAt)}
              </p>
            </div>
          )}

          {/* Customer Reason Snapshot */}
          <div style={{ backgroundColor: '#FDFBF9', padding: '1rem', borderRadius: '8px', marginBottom: '1.75rem', border: '1px solid #EAE7E4' }}>
            <p style={{ fontSize: '0.85rem', color: '#5C5552' }}>
              <strong>Return Reason:</strong> {returnReq.customerReason}
            </p>
            {returnReq.customerComments && (
              <p style={{ fontSize: '0.85rem', color: '#5C5552', marginTop: '4px' }}>
                <strong>Comments:</strong> {returnReq.customerComments}
              </p>
            )}
            {returnReq.adminNotes && (
              <p style={{ fontSize: '0.85rem', color: '#C98491', marginTop: '6px' }}>
                <strong>Boutique Response:</strong> {returnReq.adminNotes}
              </p>
            )}
          </div>

          {/* Items returned */}
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Garments in this Return</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {returnReq.items?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', border: '1px solid #EAE7E4', borderRadius: '6px' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</p>
                  <p style={{ fontSize: '0.8rem', color: '#8A817D' }}>
                    SKU: {item.sku} | Size: {item.size} | Colour: {item.color} | Qty: {item.quantity}
                  </p>
                </div>
                <span style={{ fontWeight: 600 }}>{formatINR(item.price)}</span>
              </div>
            ))}
          </div>

          {/* Status Timeline */}
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Review Timeline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '1.5rem', position: 'relative' }}>
            {returnReq.statusHistory?.map((h, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-1.5rem',
                    top: '4px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: i === returnReq.statusHistory.length - 1 ? '#C98491' : '#262322',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{h.status}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#8A817D' }}>
                    {formatDateTime(h.timestamp)}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#5C5552' }}>{h.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
