import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatINR, formatDate } from '../utils/formatters';
import { Package, FileText, ArrowRight, Truck, ChevronRight, Loader2 } from 'lucide-react';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const res = await api.get('/orders/my-orders');
        if (res.data?.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.warn('Failed to load orders:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <Loader2 size={32} className="animate-spin" color="#C98491" style={{ margin: '0 auto 1rem' }} />
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F7F4F0', padding: '3rem 0 5rem', minHeight: '75vh' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C98491', fontWeight: 700 }}>
              Order History
            </span>
            <h1 style={{ fontSize: '2.2rem', marginTop: '0.2rem' }}>My Orders ({orders.length})</h1>
          </div>
          <Link to="/products" className="btn btn-secondary btn-sm">
            Shop More Garments
          </Link>
        </div>

        {orders.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #EAE7E4',
              padding: '3rem',
              textAlign: 'center',
            }}
          >
            <Package size={42} color="#C98491" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No orders placed yet</h3>
            <p style={{ color: '#5C5552', marginBottom: '1.5rem' }}>
              Explore our boutique collection of kurtas, lehengas, and dress materials.
            </p>
            <Link to="/products" className="btn btn-primary">
              Discover Clothing Collection
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map((order) => (
              <div
                key={order._id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #EAE7E4',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Order Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #EAE7E4',
                    paddingBottom: '1rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#8A817D' }}>
                      Order Placed: {formatDate(order.createdAt)}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', color: '#262322' }}>{order.orderNumber}</h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span
                      className={`badge ${
                        order.fulfillmentStatus === 'Delivered'
                          ? 'badge-success'
                          : order.fulfillmentStatus === 'Cancelled'
                          ? 'badge-error'
                          : 'badge-rose'
                      }`}
                    >
                      {order.fulfillmentStatus}
                    </span>

                    <span
                      className={`badge ${
                        order.payment?.status === 'PAID' ? 'badge-success' : 'badge-warning'
                      }`}
                    >
                      {order.payment?.status} ({order.payment?.method})
                    </span>
                  </div>
                </div>

                {/* Items preview list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {order.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={item.image || '/assets/images/purple-embroidered-kurti.jpg'}
                        alt={item.name}
                        style={{ width: '52px', height: '65px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</p>
                        <p style={{ fontSize: '0.8rem', color: '#8A817D' }}>
                          Size: {item.size} • Colour: {item.color} • Qty: {item.quantity}
                        </p>
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {formatINR(item.lineTotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Controls */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #EAE7E4',
                    paddingTop: '1rem',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <span style={{ color: '#5C5552', fontSize: '0.85rem' }}>Order Total: </span>
                    <strong style={{ fontSize: '1.1rem', color: '#262322' }}>
                      {formatINR(order.pricing?.finalTotal)}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link
                      to={`/invoices/${order.orderNumber}`}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <FileText size={15} /> Download Bill
                    </Link>
                    <Link
                      to={`/orders/${order._id}`}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      Details & Tracking <ChevronRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
