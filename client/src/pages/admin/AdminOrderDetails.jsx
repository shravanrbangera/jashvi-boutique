import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { formatINR, formatDateTime } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Truck,
  CheckCircle,
  XCircle,
  FileText,
  Banknote,
  Shield,
  Loader2,
} from 'lucide-react';

export default function AdminOrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status update form
  const [status, setStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [courierPartner, setCourierPartner] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Cancel order modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // COD collection modal
  const [codModalOpen, setCodModalOpen] = useState(false);
  const [codAmount, setCodAmount] = useState('');
  const [codCollector, setCodCollector] = useState('');
  const [codNotes, setCodNotes] = useState('');

  const { addToast } = useToast();

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data?.success) {
        setOrder(res.data.order);
        setInvoice(res.data.invoice);
        setStatus(res.data.order.fulfillmentStatus);
        setCourierPartner(res.data.order.trackingDetails?.courierPartner || 'Local Boutique Delivery');
        setTrackingNumber(res.data.order.trackingDetails?.trackingNumber || '');
        setEstimatedDelivery(res.data.order.trackingDetails?.estimatedDelivery || '');
        setCodAmount(res.data.order.pricing?.finalTotal || '');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdatingStatus(true);
      const res = await api.patch(`/orders/${id}/fulfillment`, {
        status,
        note: statusNote.trim() || `Status updated to ${status} by admin.`,
        courierPartner,
        trackingNumber,
        estimatedDelivery,
      });

      if (res.data?.success) {
        addToast('Order fulfillment status updated successfully!', 'success');
        setStatusNote('');
        loadOrder();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/orders/${id}/cancel`, { reason: cancelReason });
      if (res.data?.success) {
        addToast('Order cancelled and stock restored to inventory.', 'success');
        setCancelModalOpen(false);
        loadOrder();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCODReconcile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/payments/orders/${id}/cod-collect`, {
        amountCollected: Number(codAmount),
        collectedBy: codCollector || 'Boutique Staff',
        notes: codNotes,
      });
      if (res.data?.success) {
        addToast('COD payment collected and marked as PAID.', 'success');
        setCodModalOpen(false);
        loadOrder();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleApproveInvoice = async () => {
    if (!invoice?._id) return;
    try {
      const res = await api.post(`/invoices/${invoice._id}/approve`);
      if (res.data?.success) {
        addToast('Invoice approved and marked as Final Verified Bill!', 'success');
        loadOrder();
      }
    } catch (err) {
      addToast(err.message || 'Failed to approve invoice', 'error');
    }
  };

  const handleConfirmOrderDirect = async () => {
    try {
      setUpdatingStatus(true);
      const res = await api.patch(`/orders/${id}/fulfillment`, {
        status: 'Confirmed',
        note: 'Order confirmed and verified by boutique administrator.',
      });
      if (res.data?.success) {
        addToast('Order confirmed successfully by admin!', 'success');
        loadOrder();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <Loader2 size={32} className="animate-spin" color="#C98491" style={{ margin: '0 auto 1rem' }} />
        <p>Loading order dossier...</p>
      </div>
    );
  }

  if (!order) {
    return <p>Order not found.</p>;
  }

  return (
    <div style={{ maxWidth: '960px' }}>
      <Link
        to="/admin/orders"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#5C5552', marginBottom: '1.5rem', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} /> Back to Customer Orders
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C98491', fontWeight: 700 }}>
            Order Operations
          </span>
          <h1 style={{ fontSize: '2rem', margin: '0.2rem 0' }}>{order.orderNumber}</h1>
          <p style={{ color: '#5C5552', fontSize: '0.85rem' }}>
            Internal Tracking Token: <code>{order.trackingToken}</code>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to={`/invoices/${order.orderNumber}`} className="btn btn-secondary btn-sm">
            <FileText size={16} /> Tax Invoice
          </Link>

          {order.fulfillmentStatus === 'Placed' && (
            <button
              onClick={handleConfirmOrderDirect}
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: '#2E7D32', borderColor: '#2E7D32', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
            >
              <CheckCircle size={16} /> Confirm Order
            </button>
          )}

          {invoice?.approvalStatus === 'PENDING' && (
            <button
              onClick={handleApproveInvoice}
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: '#2E7D32', borderColor: '#2E7D32', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <CheckCircle size={16} /> Approve Bill
            </button>
          )}

          {order.payment?.method === 'COD' && order.payment?.status !== 'PAID' && (
            <button
              onClick={() => setCodModalOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: '#2E7D32', borderColor: '#2E7D32' }}
            >
              <Banknote size={16} /> Record COD Cash Collection
            </button>
          )}

          {order.fulfillmentStatus !== 'Cancelled' && order.fulfillmentStatus !== 'Delivered' && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ color: '#D32F2F', borderColor: '#FFCDD2' }}
            >
              Cancel & Restore Stock
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left Column: Items & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Items */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #EAE7E4',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', borderBottom: '1px solid #EAE7E4', paddingBottom: '0.5rem' }}>
              Consignment Items ({order.items?.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {order.items?.map((item) => (
                <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '56px', height: '70px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600 }}>{item.name}</p>
                    <p style={{ fontSize: '0.8rem', color: '#8A817D' }}>
                      SKU: {item.sku} | Size: <strong>{item.size}</strong> | Colour: <strong>{item.color}</strong>
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#5C5552' }}>
                      Qty: {item.quantity} × {formatINR(item.unitPrice)}
                    </p>
                  </div>
                  <strong style={{ fontSize: '1rem' }}>{formatINR(item.lineTotal)}</strong>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #EAE7E4', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#5C5552' }}>Subtotal:</span>
                <span>{formatINR(order.pricing?.subtotal)}</span>
              </div>
              {order.pricing?.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2E7D32', marginBottom: '0.4rem' }}>
                  <span>Discount:</span>
                  <span>- {formatINR(order.pricing?.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#5C5552' }}>Delivery Charge:</span>
                <span>{order.pricing?.deliveryCharge === 0 ? 'FREE' : formatINR(order.pricing?.deliveryCharge)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  fontSize: '1.15rem',
                  borderTop: '2px solid #EAE7E4',
                  paddingTop: '0.5rem',
                  marginTop: '0.4rem',
                }}
              >
                <span>Final Payable:</span>
                <span style={{ color: '#C98491' }}>{formatINR(order.pricing?.finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #EAE7E4',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid #EAE7E4', paddingBottom: '0.5rem' }}>
              Customer & Shipping Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.9rem' }}>
              <div>
                <p style={{ color: '#8A817D', fontSize: '0.75rem', textTransform: 'uppercase' }}>Customer Account</p>
                <p style={{ fontWeight: 600 }}>{order.user?.name}</p>
                <p style={{ color: '#5C5552' }}>Email: {order.user?.email}</p>
                <p style={{ color: '#5C5552' }}>Phone: {order.user?.phone}</p>
              </div>

              <div>
                <p style={{ color: '#8A817D', fontSize: '0.75rem', textTransform: 'uppercase' }}>Delivery Address</p>
                <p style={{ fontWeight: 600 }}>{order.deliveryAddress?.fullName}</p>
                <p style={{ color: '#5C5552' }}>
                  {order.deliveryAddress?.addressLine}<br />
                  {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - <strong>{order.deliveryAddress?.pincode}</strong><br />
                  Phone: {order.deliveryAddress?.phone}
                </p>
              </div>
            </div>

            {order.notes && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#FDFBF9', borderRadius: '6px', fontSize: '0.85rem' }}>
                <strong>Customer Note:</strong> {order.notes}
              </div>
            )}
          </div>

          {/* Timeline Audit */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #EAE7E4',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', borderBottom: '1px solid #EAE7E4', paddingBottom: '0.5rem' }}>
              Fulfillment Audit History
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '1.5rem', position: 'relative' }}>
              {order.timeline?.map((t, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1.5rem',
                      top: '4px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: idx === order.timeline.length - 1 ? '#C98491' : '#262322',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <strong>{t.status}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#8A817D' }}>{formatDateTime(t.timestamp)}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#5C5552' }}>
                    {t.note} <span style={{ color: '#8A817D' }}>({t.updatedBy})</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Status Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status Update Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #EAE7E4',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Update Status</h3>

            <form onSubmit={handleStatusUpdate}>
              <div className="form-group">
                <label className="form-label">Fulfillment Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="form-select"
                >
                  <option value="Placed">Placed</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Courier Partner</label>
                <input
                  type="text"
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Local Boutique Delivery / BlueDart / DTDC"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Airway Bill / Tracking No.</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="form-input"
                  placeholder="e.g. BD-8923412"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Delivery Date</label>
                <input
                  type="text"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Tomorrow by 6:00 PM"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status Note (Logged to Customer)</label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="form-textarea"
                  placeholder="e.g. Packed in boutique gift box and handed over to courier partner."
                />
              </div>

              <button
                type="submit"
                disabled={updatingStatus}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {updatingStatus ? <Loader2 size={16} className="animate-spin" /> : 'Save & Publish Update'}
              </button>
            </form>
          </div>

          {/* Payment Status Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #EAE7E4',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Payment Status</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#8A817D' }}>Method:</span>{' '}
                <strong>{order.payment?.method}</strong>
              </div>
              <div>
                <span style={{ color: '#8A817D' }}>Status:</span>{' '}
                <span className={`badge ${order.payment?.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                  {order.payment?.status}
                </span>
              </div>
              {order.payment?.transactionId && (
                <div>
                  <span style={{ color: '#8A817D' }}>Transaction ID:</span>{' '}
                  <code>{order.payment.transactionId}</code>
                </div>
              )}
              {order.payment?.collectedByAdmin && (
                <div style={{ color: '#2E7D32', marginTop: '0.5rem' }}>
                  <strong>Reconciled by:</strong> {order.payment.collectedByAdmin}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#D32F2F' }}>
              Cancel Order & Restore Stock
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#5C5552', marginBottom: '1.25rem' }}>
              This action will mark the order as Cancelled and automatically increment inventory back into the products table.
            </p>
            <form onSubmit={handleCancelOrder}>
              <div className="form-group">
                <label className="form-label">Cancellation Reason *</label>
                <textarea
                  required
                  rows={3}
                  className="form-textarea"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Customer requested cancellation / address incorrect..."
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setCancelModalOpen(false)} className="btn btn-secondary btn-sm">
                  Close
                </button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ backgroundColor: '#D32F2F', borderColor: '#D32F2F' }}>
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COD Collection Modal */}
      {codModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              Record COD Collection
            </h3>
            <form onSubmit={handleCODReconcile}>
              <div className="form-group">
                <label className="form-label">Amount Collected (₹) *</label>
                <input
                  type="number"
                  required
                  value={codAmount}
                  onChange={(e) => setCodAmount(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Collected By (Staff / Courier Name) *</label>
                <input
                  type="text"
                  required
                  value={codCollector}
                  onChange={(e) => setCodCollector(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Ramesh (Courier Driver)"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Reconciliation Notes</label>
                <textarea
                  rows={2}
                  value={codNotes}
                  onChange={(e) => setCodNotes(e.target.value)}
                  className="form-textarea"
                  placeholder="Cash verified and deposited into boutique register"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setCodModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ backgroundColor: '#2E7D32', borderColor: '#2E7D32' }}>
                  Confirm Cash Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
