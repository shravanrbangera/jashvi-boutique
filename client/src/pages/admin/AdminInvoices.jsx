import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatINR, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Search,
  Sliders,
  History,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  X,
  IndianRupee,
} from 'lucide-react';

export default function AdminInvoices() {
  const { addToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Modal states
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustField, setAdjustField] = useState('discount');
  const [adjustValue, setAdjustValue] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [submittingAdjust, setSubmittingAdjust] = useState(false);

  // History modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [adjustmentHistory, setAdjustmentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [page, search]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invoices', {
        params: { page, limit: 15, search: search.trim() },
      });
      if (res.data.success) {
        setInvoices(res.data.invoices || []);
        setPagination(res.data.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (inv) => {
    try {
      const res = await api.post(`/invoices/${inv._id}/approve`);
      if (res.data.success) {
        addToast(`Invoice ${inv.invoiceNumber} approved & finalized!`, 'success');
        fetchInvoices();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to approve invoice', 'error');
    }
  };

  const handleOpenAdjust = (inv) => {
    setSelectedInvoice(inv);
    setAdjustField('discount');
    setAdjustValue(inv.pricing?.discount || 0);
    setAdjustReason('');
    setShowAdjustModal(true);
  };

  const handleOpenHistory = async (inv) => {
    setSelectedInvoice(inv);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    try {
      const res = await api.get(`/invoices/${inv._id}/adjustments`);
      if (res.data.success) {
        setAdjustmentHistory(res.data.audits || []);
      }
    } catch (err) {
      addToast('Failed to fetch adjustment history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustReason || adjustReason.trim().length < 5) {
      addToast('A detailed reason (min 5 characters) is mandatory for financial adjustments.', 'warning');
      return;
    }

    try {
      setSubmittingAdjust(true);
      const res = await api.post(`/invoices/${selectedInvoice._id}/adjust`, {
        field: adjustField,
        newValue: Number(adjustValue),
        reason: adjustReason.trim(),
      });

      if (res.data.success) {
        addToast('Invoice adjusted and audit trail permanently logged.', 'success');
        setShowAdjustModal(false);
        fetchInvoices();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to adjust invoice', 'error');
    } finally {
      setSubmittingAdjust(false);
    }
  };

  // Preview recalculated final total in modal
  const calculatePreviewTotal = () => {
    if (!selectedInvoice) return 0;
    const p = selectedInvoice.pricing || {};
    let sub = p.subtotal || 0;
    let disc = adjustField === 'discount' ? Number(adjustValue) || 0 : p.discount || 0;
    let del = adjustField === 'deliveryCharge' ? Number(adjustValue) || 0 : p.deliveryCharge || 0;
    let tax = adjustField === 'tax' ? Number(adjustValue) || 0 : p.tax || 0;
    return Math.max(0, sub - disc + del + tax);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#262322' }}>
            Invoices & Audits
          </h1>
          <p style={{ color: '#6E6765', fontSize: '0.9rem' }}>
            Auditable INR invoices with snapshot preservation and traceable admin adjustments.
          </p>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FFFFFF', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #D5CFC9', minWidth: '280px' }}>
          <Search size={18} color="#8C827A" />
          <input
            type="text"
            placeholder="Search invoice #, order #, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8C827A' }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Invoices Table Card */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #EAE7E4', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6E6765' }}>Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8C827A' }}>
            <FileText size={42} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p>No invoices found matching criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9F8F6', borderBottom: '1px solid #EAE7E4', color: '#6E6765', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Invoice #</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Order Ref</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Subtotal</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Discounts</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Delivery</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Final Total</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Payment</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Bill Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Adjustments</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv._id} style={{ borderBottom: '1px solid #F1EFEA', transition: 'background-color 0.15s' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#262322' }}>
                      {inv.invoiceNumber}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Link to={`/admin/orders/${inv.order}`} style={{ color: '#C98491', fontWeight: 500, textDecoration: 'none' }}>
                        {inv.orderNumber}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500, color: '#262322' }}>{inv.customerInfo?.name || 'Guest/Customer'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#8C827A' }}>{inv.customerInfo?.phone}</div>
                    </td>
                    <td style={{ padding: '1rem', color: '#6E6765', whiteSpace: 'nowrap' }}>
                      {formatDate(inv.createdAt)}
                    </td>
                    <td style={{ padding: '1rem', color: '#262322' }}>
                      {formatINR(inv.pricing?.subtotal || 0)}
                    </td>
                    <td style={{ padding: '1rem', color: inv.pricing?.discount > 0 ? '#16A34A' : '#6E6765' }}>
                      {inv.pricing?.discount > 0 ? `-${formatINR(inv.pricing.discount)}` : '₹0'}
                    </td>
                    <td style={{ padding: '1rem', color: '#6E6765' }}>
                      {inv.pricing?.deliveryCharge > 0 ? formatINR(inv.pricing.deliveryCharge) : 'FREE'}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#262322' }}>
                      {formatINR(inv.pricing?.finalTotal || 0)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: inv.payment?.status === 'PAID' ? '#DCFCE7' : '#FEF3C7',
                        color: inv.payment?.status === 'PAID' ? '#15803D' : '#B45309',
                      }}>
                        {inv.payment?.method} ({inv.payment?.status})
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {inv.approvalStatus === 'APPROVED' ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          backgroundColor: '#DCFCE7',
                          color: '#15803D',
                        }}>
                          <CheckCircle2 size={12} /> Approved
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApprove(inv)}
                          title="Approve and finalize provisional bill"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            backgroundColor: '#FEF3C7',
                            color: '#B45309',
                            border: '1px solid #FCD34D',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Approve Bill
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {inv.adjustmentSummary?.hasBeenAdjusted ? (
                        <button
                          onClick={() => handleOpenHistory(inv)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            backgroundColor: '#FEF9C3',
                            color: '#854D0E',
                            border: '1px solid #FDE047',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          <History size={12} />
                          {inv.adjustmentSummary.adjustmentCount} audit(s)
                        </button>
                      ) : (
                        <span style={{ color: '#A8A29E', fontSize: '0.75rem' }}>Original</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <Link
                          to={`/orders/${inv.orderNumber}/invoice`}
                          target="_blank"
                          rel="noreferrer"
                          title="Printable customer invoice view"
                          style={{
                            padding: '0.4rem',
                            borderRadius: '4px',
                            border: '1px solid #D5CFC9',
                            color: '#262322',
                            backgroundColor: '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <button
                          onClick={() => handleOpenAdjust(inv)}
                          title="Controlled price/tax adjustment"
                          style={{
                            padding: '0.4rem 0.6rem',
                            borderRadius: '4px',
                            border: '1px solid #C98491',
                            color: '#FFFFFF',
                            backgroundColor: '#C98491',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <Sliders size={13} />
                          Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #EAE7E4' }}>
            <span style={{ fontSize: '0.8rem', color: '#6E6765' }}>
              Showing Page {pagination.page} of {pagination.pages} ({pagination.total} invoices)
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
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                style={{ padding: '0.35rem 0.75rem', borderRadius: '4px', border: '1px solid #D5CFC9', background: '#FFFFFF', cursor: page >= pagination.pages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controlled Adjustment Modal */}
      {showAdjustModal && selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', maxWidth: '520px', width: '100%', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #EAE7E4', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#262322' }}>
                  Controlled Invoice Adjustment
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#6E6765' }}>
                  Invoice: {selectedInvoice.invoiceNumber} • Order: {selectedInvoice.orderNumber}
                </p>
              </div>
              <button onClick={() => setShowAdjustModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#6E6765" />
              </button>
            </div>

            <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.8rem', color: '#92400E' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Mandatory Audit Requirement:</strong> Every adjustment creates a permanent, tamper-evident audit record with administrator ID, previous value, new value, and operational rationale.
              </div>
            </div>

            <form onSubmit={handleSaveAdjustment}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#262322', marginBottom: '0.35rem' }}>
                  Field to Adjust
                </label>
                <select
                  value={adjustField}
                  onChange={(e) => {
                    const f = e.target.value;
                    setAdjustField(f);
                    setAdjustValue(selectedInvoice.pricing?.[f] || 0);
                  }}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                >
                  <option value="discount">Special Discount (₹)</option>
                  <option value="deliveryCharge">Delivery Charge (₹)</option>
                  <option value="tax">Tax / GST (₹)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#262322', marginBottom: '0.35rem' }}>
                  New Value in INR (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={adjustValue}
                  onChange={(e) => setAdjustValue(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                />
              </div>

              {/* Live Preview Card */}
              <div style={{ backgroundColor: '#F9F8F6', padding: '0.85rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#6E6765' }}>Current Final Total:</span>
                  <span style={{ fontWeight: 600 }}>{formatINR(selectedInvoice.pricing?.finalTotal || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #D5CFC9', paddingTop: '0.35rem' }}>
                  <span style={{ fontWeight: 700, color: '#262322' }}>New Recalculated Total:</span>
                  <span style={{ fontWeight: 700, color: '#C98491', fontSize: '1rem' }}>{formatINR(calculatePreviewTotal())}</span>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#262322', marginBottom: '0.35rem' }}>
                  Operational Reason (Required, min 5 chars) *
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Approved courtesy discount of ₹200 as per boutique manager authorization."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #D5CFC9', background: '#FFFFFF', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdjust}
                  style={{ padding: '0.6rem 1.25rem', borderRadius: '6px', border: 'none', background: '#262322', color: '#FFFFFF', fontWeight: 600, cursor: submittingAdjust ? 'not-allowed' : 'pointer' }}
                >
                  {submittingAdjust ? 'Auditing & Saving...' : 'Save & Record Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit History Drawer Modal */}
      {showHistoryModal && selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', maxWidth: '640px', width: '100%', padding: '1.5rem', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #EAE7E4', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#262322' }}>
                  Invoice Audit Trail
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#6E6765' }}>
                  Invoice: {selectedInvoice.invoiceNumber}
                </p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#6E6765" />
              </button>
            </div>

            {loadingHistory ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6E6765' }}>Loading adjustment history...</div>
            ) : adjustmentHistory.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#8C827A' }}>
                No recorded adjustments. This invoice retains its exact order-time snapshot.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {adjustmentHistory.map((audit) => (
                  <div key={audit._id} style={{ padding: '0.85rem', backgroundColor: '#F9F8F6', borderRadius: '6px', borderLeft: '4px solid #C98491' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: '#262322', fontSize: '0.85rem' }}>
                        Field: <code style={{ backgroundColor: '#EAE7E4', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>{audit.fieldAdjusted}</code>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#8C827A' }}>{formatDate(audit.timestamp)}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6E6765', marginBottom: '0.25rem' }}>
                      Changed from <strong>{formatINR(audit.previousValue)}</strong> to <strong>{formatINR(audit.newValue)}</strong> (Diff: {formatINR(audit.amountChanged)})
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#262322', fontStyle: 'italic', backgroundColor: '#FFFFFF', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #EAE7E4' }}>
                      "{audit.reason}"
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#8C827A', marginTop: '0.35rem' }}>
                      Admin: {audit.adminEmail}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
