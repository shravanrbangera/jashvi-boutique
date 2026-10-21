import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  FileText,
  Truck,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (paymentFilter) params.set('paymentStatus', paymentFilter);
      if (search) params.set('search', search);

      const res = await api.get(`/orders?${params.toString()}`);
      if (res.data?.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId, orderNum) => {
    try {
      const res = await api.patch(`/orders/${orderId}/fulfillment`, {
        status: 'Confirmed',
        note: `Order ${orderNum} officially confirmed by boutique administrator.`,
      });
      if (res.data?.success) {
        addToast(`Order ${orderNum} confirmed successfully!`, 'success');
        loadOrders();
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message, 'error');
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, paymentFilter, search]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C98491', fontWeight: 700 }}>
            Order Fulfillment
          </span>
          <h1 style={{ fontSize: '2rem', marginTop: '0.2rem' }}>Customer Orders ({orders.length})</h1>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #EAE7E4',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search by order number, customer, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-select"
          style={{ width: 'auto', fontSize: '0.85rem', padding: '0.45rem 1.75rem 0.45rem 0.75rem' }}
        >
          <option value="">All Fulfillment Statuses</option>
          <option value="Placed">Placed</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Processing">Processing</option>
          <option value="Packed">Packed</option>
          <option value="Shipped">Shipped</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="form-select"
          style={{ width: 'auto', fontSize: '0.85rem', padding: '0.45rem 1.75rem 0.45rem 0.75rem' }}
        >
          <option value="">All Payment Statuses</option>
          <option value="PAID">PAID</option>
          <option value="PENDING">PENDING</option>
          <option value="FAILED">FAILED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
      </div>

      {/* Orders Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #EAE7E4',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Loader2 size={32} className="animate-spin" color="#C98491" style={{ margin: '0 auto 1rem' }} />
            <p>Loading customer orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <p style={{ color: '#8A817D' }}>No orders found matching current filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#FDFBF9', borderBottom: '1px solid #EAE7E4', color: '#5C5552' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Order Number</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Date Placed</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Total Amount</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Payment</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Fulfillment</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord._id} style={{ borderBottom: '1px solid #EAE7E4' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                      <Link to={`/admin/orders/${ord._id}`} style={{ color: '#C98491' }}>
                        {ord.orderNumber}
                      </Link>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <p style={{ fontWeight: 600 }}>{ord.user?.name}</p>
                      <p style={{ fontSize: '0.75rem', color: '#8A817D' }}>{ord.user?.phone}</p>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#5C5552' }}>
                      {formatDate(ord.createdAt)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                      {formatINR(ord.pricing?.finalTotal)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge ${ord.payment?.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                        {ord.payment?.status} ({ord.payment?.method})
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        className={`badge ${
                          ord.fulfillmentStatus === 'Delivered'
                            ? 'badge-success'
                            : ord.fulfillmentStatus === 'Cancelled'
                            ? 'badge-error'
                            : ord.fulfillmentStatus === 'Confirmed'
                            ? 'badge-success'
                            : ord.fulfillmentStatus === 'Placed'
                            ? 'badge-warning'
                            : 'badge-rose'
                        }`}
                        style={
                          ord.fulfillmentStatus === 'Placed'
                            ? { backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D' }
                            : ord.fulfillmentStatus === 'Confirmed'
                            ? { backgroundColor: '#DCFCE7', color: '#15803D' }
                            : {}
                        }
                      >
                        {ord.fulfillmentStatus === 'Placed' ? 'Placed (Needs Confirmation)' : ord.fulfillmentStatus}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {ord.fulfillmentStatus === 'Placed' && (
                          <button
                            onClick={() => handleConfirmOrder(ord._id, ord.orderNumber)}
                            className="btn btn-sm"
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              backgroundColor: '#2E7D32',
                              color: '#FFFFFF',
                              border: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                            title="Confirm this order"
                          >
                            <CheckCircle size={13} /> Confirm
                          </button>
                        )}
                        <Link
                          to={`/invoices/${ord.orderNumber}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="View Tax Invoice"
                        >
                          <FileText size={13} />
                        </Link>
                        <Link
                          to={`/admin/orders/${ord._id}`}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          Manage
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
