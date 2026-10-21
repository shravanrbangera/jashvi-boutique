import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatINR, formatDate } from '../../utils/formatters';
import {
  Shirt,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Users,
  ChevronRight,
  Boxes,
  Loader2,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await api.get('/admin/overview');
        if (res.data?.success) {
          setStats(res.data.stats);
          setRecentOrders(res.data.recentOrders || []);
        }
      } catch (err) {
        console.warn('Failed to load dashboard metrics:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <Loader2 size={36} className="animate-spin" color="#C98491" style={{ margin: '0 auto 1rem' }} />
        <p>Loading real-time boutique operational metrics...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Confirmed Revenue',
      value: formatINR(stats?.confirmedRevenue || 0),
      desc: 'From verified PAID transactions',
      icon: TrendingUp,
      color: '#2E7D32',
      bgColor: '#E8F5E9',
    },
    {
      title: 'Total Customer Orders',
      value: stats?.totalOrders || 0,
      desc: `${stats?.pendingFulfillmentOrders || 0} awaiting fulfillment`,
      icon: ShoppingBag,
      color: '#C98491',
      bgColor: '#F1DFE2',
    },
    {
      title: 'Active Products',
      value: `${stats?.activeProducts || 0} / ${stats?.totalProducts || 0}`,
      desc: 'Published in store catalog',
      icon: Shirt,
      color: '#0288D1',
      bgColor: '#E1F5FE',
    },
    {
      title: 'Low Stock Variants',
      value: stats?.lowStockVariantsCount || 0,
      desc: `${stats?.outOfStockVariantsCount || 0} currently out of stock`,
      icon: Boxes,
      color: '#ED6C02',
      bgColor: '#FFF3E0',
    },
    {
      title: 'Return Requests',
      value: stats?.pendingReturns || 0,
      desc: `${stats?.awaitingRefund || 0} awaiting refund payout`,
      icon: RotateCcw,
      color: '#D32F2F',
      bgColor: '#FFEBEE',
    },
    {
      title: 'Registered Customers',
      value: stats?.totalCustomers || 0,
      desc: 'Active shopper accounts',
      icon: Users,
      color: '#5C5552',
      bgColor: '#EAE7E4',
    },
  ];

  return (
    <div>
      {/* Top Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C98491', fontWeight: 700 }}>
          Live Administration Overview
        </span>
        <h1 style={{ fontSize: '2rem', marginTop: '0.2rem' }}>Dashboard Overview</h1>
        <p style={{ color: '#5C5552', fontSize: '0.95rem' }}>
          Real-time metrics calculated directly from Jashvi Boutique database transactions.
        </p>
      </div>

      {/* Metrics 3x2 Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #EAE7E4',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  backgroundColor: card.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={22} color={card.color} />
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: '#8A817D', textTransform: 'uppercase', fontWeight: 600 }}>
                  {card.title}
                </span>
                <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#262322', margin: '0.1rem 0' }}>
                  {card.value}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#5C5552' }}>{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #EAE7E4',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Recent Customer Orders</h3>
            <p style={{ fontSize: '0.85rem', color: '#8A817D' }}>Latest placed orders awaiting processing</p>
          </div>
          <Link to="/admin/orders" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            View All Orders <ChevronRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p style={{ color: '#8A817D', padding: '1.5rem 0', textAlign: 'center' }}>
            No customer orders recorded yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#FDFBF9', borderBottom: '1px solid #EAE7E4', color: '#5C5552' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Order Number</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Total Amount</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Payment</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Fulfillment</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord._id} style={{ borderBottom: '1px solid #EAE7E4' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                      <Link to={`/admin/orders/${ord._id}`} style={{ color: '#C98491' }}>
                        {ord.orderNumber}
                      </Link>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>{ord.user?.name}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#5C5552' }}>{formatDate(ord.createdAt)}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{formatINR(ord.pricing?.finalTotal)}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge ${ord.payment?.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                        {ord.payment?.status} ({ord.payment?.method})
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge badge-rose">{ord.fulfillmentStatus}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <Link to={`/admin/orders/${ord._id}`} className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>
                        Inspect
                      </Link>
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
