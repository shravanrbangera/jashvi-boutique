import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export default function AdminCustomers() {
  const { addToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/customers', {
        params: { page, limit: 15, search: search.trim() },
      });
      if (res.data.success) {
        setCustomers(res.data.customers || []);
        setPagination({ total: res.data.total, totalPages: res.data.totalPages });
      }
    } catch (err) {
      addToast('Failed to load registered customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#262322' }}>
            Registered Customers
          </h1>
          <p style={{ color: '#6E6765', fontSize: '0.9rem' }}>
            Customer accounts, contact information, and registration records.
          </p>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FFFFFF', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #D5CFC9', minWidth: '280px' }}>
          <Search size={18} color="#8C827A" />
          <input
            type="text"
            placeholder="Search customer name, email, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {/* Customer Count Stat Badge */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid #EAE7E4', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ backgroundColor: '#FDF2F4', padding: '0.5rem', borderRadius: '6px', color: '#C98491' }}>
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6E6765', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Registered Customers</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#262322' }}>{pagination.total}</div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #EAE7E4', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6E6765' }}>Loading customer list...</div>
        ) : customers.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8C827A' }}>
            <Users size={42} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p>No customer accounts found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9F8F6', borderBottom: '1px solid #EAE7E4', color: '#6E6765', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Customer Name</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Email Address</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Phone Number</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Joined Date</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Saved Addresses</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid #F1EFEA' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#262322' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#F1DFE2', color: '#C98491', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                          {c.name?.charAt(0).toUpperCase()}
                        </div>
                        {c.name}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#44403C' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={14} color="#8C827A" />
                        {c.email}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#44403C' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={14} color="#8C827A" />
                        {c.phone || 'Not provided'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#6E6765', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={14} color="#8C827A" />
                        {formatDate(c.createdAt)}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#6E6765' }}>
                      {c.addresses?.length || 0} address(es)
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: c.role === 'admin' ? '#FEF3C7' : '#DCFCE7',
                        color: c.role === 'admin' ? '#B45309' : '#15803D',
                      }}>
                        {c.role}
                      </span>
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
  );
}
