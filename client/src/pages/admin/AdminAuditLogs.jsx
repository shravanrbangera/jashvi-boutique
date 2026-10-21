import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatINR, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import {
  ScrollText,
  BarChart3,
  Search,
  Filter,
  Shield,
  Clock,
  IndianRupee,
  ShoppingBag,
  CreditCard,
  RotateCcw,
} from 'lucide-react';

export default function AdminAuditLogs() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'reports'

  // Audit Logs State
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Reports State
  const [reports, setReports] = useState(null);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    } else {
      fetchReports();
    }
  }, [activeTab, page, actionFilter]);

  const fetchAuditLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await api.get('/admin/audit-logs', {
        params: { page, limit: 20, action: actionFilter || undefined },
      });
      if (res.data.success) {
        setLogs(res.data.logs || []);
        setPagination({ total: res.data.total, totalPages: res.data.totalPages });
      }
    } catch (err) {
      addToast('Failed to load audit logs', 'error');
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoadingReports(true);
      const res = await api.get('/admin/reports');
      if (res.data.success) {
        setReports(res.data);
      }
    } catch (err) {
      addToast('Failed to load reports', 'error');
    } finally {
      setLoadingReports(false);
    }
  };

  const formatActionName = (act) => {
    return act
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#262322' }}>
            Audit History & Reports
          </h1>
          <p style={{ color: '#6E6765', fontSize: '0.9rem' }}>
            Traceable records of administrative actions, price edits, inventory adjustments, and sales breakdowns.
          </p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', backgroundColor: '#EAE7E4', borderRadius: '6px', padding: '0.2rem' }}>
          <button
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '4px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'audit' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'audit' ? '#262322' : '#6E6765',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <ScrollText size={16} />
            Audit History
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '4px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'reports' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'reports' ? '#262322' : '#6E6765',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <BarChart3 size={16} />
            Sales & Operational Reports
          </button>
        </div>
      </div>

      {activeTab === 'audit' ? (
        <div>
          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Filter size={16} color="#6E6765" />
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.85rem', backgroundColor: '#FFFFFF' }}
              >
                <option value="">All Administrative Actions</option>
                <option value="PRODUCT_PRICE_CHANGED">Product Price Changed</option>
                <option value="INVENTORY_ADJUSTED">Inventory Adjusted</option>
                <option value="ORDER_STATUS_CHANGED">Order Status Changed</option>
                <option value="RETURN_STATUS_CHANGED">Return Status Changed</option>
                <option value="REFUND_ISSUED">Refund Issued</option>
                <option value="DELIVERY_ZONE_CREATED">Delivery Zone Created</option>
                <option value="STORE_SETTINGS_UPDATED">Settings Updated</option>
              </select>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#6E6765' }}>Total Recorded Events: {pagination.total}</span>
          </div>

          {/* Audit Logs Table */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #EAE7E4', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            {loadingLogs ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#6E6765' }}>Loading audit logs...</div>
            ) : logs.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#8C827A' }}>
                <Shield size={42} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                <p>No audit events match the selected criteria.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F9F8F6', borderBottom: '1px solid #EAE7E4', color: '#6E6765', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Action</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Entity</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Details & Context</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Administrator</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log._id} style={{ borderBottom: '1px solid #F1EFEA' }}>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            backgroundColor: log.action.includes('PRICE') || log.action.includes('REFUND') ? '#FEF3C7' : '#F4F1EA',
                            color: log.action.includes('PRICE') || log.action.includes('REFUND') ? '#B45309' : '#262322',
                          }}>
                            {formatActionName(log.action)}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#6E6765', fontSize: '0.8rem' }}>
                          <span style={{ fontWeight: 600, color: '#262322' }}>{log.entityType}</span>
                          {log.entityId && (
                            <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#8C827A' }}>
                              ID: {String(log.entityId).substring(0, 10)}...
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem', color: '#262322', maxWidth: '380px' }}>
                          <div style={{ fontSize: '0.85rem' }}>{log.details}</div>
                          {log.before && log.after && (
                            <div style={{ fontSize: '0.75rem', color: '#6E6765', marginTop: '0.2rem' }}>
                              Before: <code>{JSON.stringify(log.before)}</code> &rarr; After: <code>{JSON.stringify(log.after)}</code>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem', color: '#44403C', fontSize: '0.8rem' }}>
                          {log.adminEmail}
                        </td>
                        <td style={{ padding: '1rem', color: '#6E6765', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {formatDate(log.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #EAE7E4' }}>
                <span style={{ fontSize: '0.8rem', color: '#6E6765' }}>
                  Page {page} of {pagination.totalPages}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    style={{ padding: '0.35rem 0.75rem', borderRadius: '4px', border: '1px solid #D5CFC9', background: '#FFFFFF', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    style={{ padding: '0.35rem 0.75rem', borderRadius: '4px', border: '1px solid #D5CFC9', background: '#FFFFFF', cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Reports Tab */
        <div>
          {loadingReports || !reports ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6E6765' }}>Loading operational reports...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {/* Payment Methods Breakdown */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '8px', border: '1px solid #EAE7E4' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', color: '#262322', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard size={18} color="#C98491" />
                  Payment Methods & Collections
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(reports.paymentBreakdown || []).map((pb, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #F1EFEA' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#262322', fontSize: '0.85rem' }}>{pb._id || 'ONLINE'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#8C827A' }}>{pb.count} order(s)</div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#262322' }}>
                        {formatINR(pb.totalAmount || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Status Breakdown */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '8px', border: '1px solid #EAE7E4' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', color: '#262322', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShoppingBag size={18} color="#C98491" />
                  Orders by Fulfilment Status
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(reports.salesByStatus || []).map((sb, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #F1EFEA' }}>
                      <span style={{ fontWeight: 500, color: '#262322', fontSize: '0.85rem' }}>{sb._id}</span>
                      <span style={{ fontWeight: 700, backgroundColor: '#F4F1EA', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                        {sb.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '8px', border: '1px solid #EAE7E4' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', color: '#262322', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <IndianRupee size={18} color="#C98491" />
                  Top Selling Boutique Clothing
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(reports.topProducts || []).length === 0 ? (
                    <p style={{ color: '#8C827A', fontSize: '0.85rem' }}>No product sales recorded yet.</p>
                  ) : (
                    reports.topProducts.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #F1EFEA' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#262322', fontSize: '0.85rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#8C827A' }}>Qty Sold: {p.quantitySold}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: '#16A34A' }}>
                          {formatINR(p.totalRevenue)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Returns & Refund Stats */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '8px', border: '1px solid #EAE7E4' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', color: '#262322', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RotateCcw size={18} color="#C98491" />
                  Returns & Refunds Reconciliation
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(reports.returnStats || []).map((rs, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #F1EFEA' }}>
                      <span style={{ fontWeight: 500, color: '#262322', fontSize: '0.85rem' }}>Status: {rs._id}</span>
                      <span style={{ fontWeight: 600, color: rs._id === 'Refunded' ? '#15803D' : '#B45309', fontSize: '0.85rem' }}>
                        {rs.count} request(s)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
