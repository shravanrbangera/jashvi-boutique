import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatINR, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  IndianRupee,
  FileText,
  AlertCircle,
  X,
} from 'lucide-react';

export default function AdminReturns() {
  const { addToast } = useToast();
  const [returnsList, setReturnsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Status Update Modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [newStatus, setNewStatus] = useState('Under Review');
  const [adminNotes, setAdminNotes] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Manual Refund Record Modal
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundMethod, setRefundMethod] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [refundNotes, setRefundNotes] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/returns', {
        params: { status: statusFilter || undefined },
      });
      if (res.data.success) {
        setReturnsList(res.data.returns || []);
      }
    } catch (err) {
      addToast('Failed to load return requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (ret) => {
    setSelectedReturn(ret);
    setNewStatus(ret.status);
    setAdminNotes(ret.adminNotes || '');
    setShowStatusModal(true);
  };

  const handleOpenRefundModal = (ret) => {
    setSelectedReturn(ret);
    // Suggest refund amount from item subtotal or finalTotal
    const suggested = ret.refundDetails?.refundAmount || ret.item?.subtotal || 0;
    setRefundAmount(suggested);
    setRefundMethod('UPI');
    setTransactionRef('');
    setRefundNotes(`Manual refund for order ${ret.orderNumber}`);
    setShowRefundModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setSubmittingStatus(true);
      const res = await api.patch(`/returns/${selectedReturn._id}/status`, {
        status: newStatus,
        adminNotes: adminNotes.trim(),
      });
      if (res.data.success) {
        addToast(`Return status updated to ${newStatus}`, 'success');
        setShowStatusModal(false);
        fetchReturns();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleRecordRefund = async (e) => {
    e.preventDefault();
    if (!transactionRef || transactionRef.trim().length < 3) {
      addToast('A valid transaction reference / UTR is required for financial reconciliation.', 'warning');
      return;
    }

    try {
      setSubmittingRefund(true);
      const res = await api.post(`/returns/${selectedReturn._id}/refund`, {
        refundAmount: Number(refundAmount),
        method: refundMethod,
        transactionRef: transactionRef.trim(),
        notes: refundNotes.trim(),
      });
      if (res.data.success) {
        addToast('Manual refund officially recorded and status set to Refunded.', 'success');
        setShowRefundModal(false);
        fetchReturns();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to record refund', 'error');
    } finally {
      setSubmittingRefund(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Refunded':
        return { bg: '#DCFCE7', text: '#15803D' };
      case 'Approved':
      case 'Refund Processing':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'Rejected':
      case 'Refund Failed':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'Under Review':
      case 'Awaiting Returned Item':
        return { bg: '#FEF3C7', text: '#B45309' };
      default:
        return { bg: '#F4F1EA', text: '#262322' };
    }
  };

  const filteredReturns = returnsList.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.returnNumber?.toLowerCase().includes(q) ||
      r.orderNumber?.toLowerCase().includes(q) ||
      r.customerInfo?.name?.toLowerCase().includes(q) ||
      r.customerInfo?.phone?.includes(q) ||
      r.item?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#262322' }}>
            Returns & Refund Management
          </h1>
          <p style={{ color: '#6E6765', fontSize: '0.9rem' }}>
            Review customer return requests, inspect returns, and record audited manual refunds.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.85rem', backgroundColor: '#FFFFFF' }}
          >
            <option value="">All Statuses</option>
            <option value="Requested">Requested</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Awaiting Returned Item">Awaiting Return Delivery</option>
            <option value="Refund Processing">Refund Processing</option>
            <option value="Refunded">Refunded</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FFFFFF', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #D5CFC9' }}>
            <Search size={18} color="#8C827A" />
            <input
              type="text"
              placeholder="Search return #, order #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '0.875rem', width: '180px' }}
            />
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #EAE7E4', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6E6765' }}>Loading return requests...</div>
        ) : filteredReturns.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8C827A' }}>
            <RotateCcw size={42} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p>No return requests found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9F8F6', borderBottom: '1px solid #EAE7E4', color: '#6E6765', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Return #</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Order Ref</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Item Details</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Reason</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReturns.map((ret) => {
                  const style = getStatusBadgeStyle(ret.status);
                  return (
                    <tr key={ret._id} style={{ borderBottom: '1px solid #F1EFEA' }}>
                      <td style={{ padding: '1rem', fontWeight: 700, color: '#262322' }}>
                        {ret.returnNumber}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 500, color: '#C98491' }}>
                        {ret.orderNumber}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 500, color: '#262322' }}>{ret.customerInfo?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#8C827A' }}>{ret.customerInfo?.phone}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 500, color: '#262322' }}>{ret.item?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6E6765' }}>
                          Size: {ret.item?.size} • Color: {ret.item?.color} • Qty: {ret.item?.quantity}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8C827A' }}>
                          Value: {formatINR(ret.item?.subtotal || 0)}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#44403C', maxWidth: '200px' }}>
                        <div style={{ fontWeight: 500 }}>{ret.reason}</div>
                        {ret.details && (
                          <div style={{ fontSize: '0.75rem', color: '#8C827A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            "{ret.details}"
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: style.bg,
                          color: style.text,
                        }}>
                          {ret.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#6E6765', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {formatDate(ret.createdAt)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleOpenStatusModal(ret)}
                            style={{
                              padding: '0.35rem 0.65rem',
                              borderRadius: '4px',
                              border: '1px solid #D5CFC9',
                              background: '#FFFFFF',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            }}
                          >
                            Status
                          </button>
                          {ret.status !== 'Refunded' && (
                            <button
                              onClick={() => handleOpenRefundModal(ret)}
                              style={{
                                padding: '0.35rem 0.65rem',
                                borderRadius: '4px',
                                border: 'none',
                                background: '#16A34A',
                                color: '#FFFFFF',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              Record Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {showStatusModal && selectedReturn && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', maxWidth: '480px', width: '100%', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #EAE7E4', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#262322' }}>
                Update Return Status
              </h3>
              <button onClick={() => setShowStatusModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#6E6765" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#262322', marginBottom: '0.35rem' }}>
                  Return Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                >
                  <option value="Requested">Requested</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved (Awaiting Item Return)</option>
                  <option value="Awaiting Returned Item">Awaiting Returned Item</option>
                  <option value="Refund Processing">Refund Processing (Item Inspected)</option>
                  <option value="Refunded">Refunded</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#262322', marginBottom: '0.35rem' }}>
                  Operational / Decision Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Return approved; boutique will arrange local pickup or customer will drop off at Attavara store."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #D5CFC9', background: '#FFFFFF', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStatus}
                  style={{ padding: '0.6rem 1.25rem', borderRadius: '6px', border: 'none', background: '#262322', color: '#FFFFFF', fontWeight: 600, cursor: submittingStatus ? 'not-allowed' : 'pointer' }}
                >
                  {submittingStatus ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Manual Refund Modal */}
      {showRefundModal && selectedReturn && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', maxWidth: '500px', width: '100%', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #EAE7E4', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#262322' }}>
                  Record Manual Refund
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#6E6765' }}>
                  Return: {selectedReturn.returnNumber} • Order: {selectedReturn.orderNumber}
                </p>
              </div>
              <button onClick={() => setShowRefundModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#6E6765" />
              </button>
            </div>

            <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.8rem', color: '#1E40AF' }}>
              <strong>Reconciliation Note:</strong> Online/manual boutique refunds are audited. Record the real transaction reference/UTR after transferring funds to the customer.
            </div>

            <form onSubmit={handleRecordRefund}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.25rem' }}>
                    Refund Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.25rem' }}>
                    Refund Method *
                  </label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="BANK_TRANSFER">Bank NEFT / IMPS</option>
                    <option value="ORIGINAL_GATEWAY">Original Gateway Refund</option>
                    <option value="STORE_CREDIT">Store Credit Voucher</option>
                    <option value="OTHER">Other / Cash</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.25rem' }}>
                  Bank Reference / UTR Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR-3091823901 or UPI-Ref-98213"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#262322', marginBottom: '0.25rem' }}>
                  Accounting Notes
                </label>
                <textarea
                  rows="2"
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #D5CFC9', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #D5CFC9', background: '#FFFFFF', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRefund}
                  style={{ padding: '0.6rem 1.25rem', borderRadius: '6px', border: 'none', background: '#16A34A', color: '#FFFFFF', fontWeight: 600, cursor: submittingRefund ? 'not-allowed' : 'pointer' }}
                >
                  {submittingRefund ? 'Recording...' : 'Confirm & Mark Refunded'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
