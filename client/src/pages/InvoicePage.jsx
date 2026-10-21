import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { formatINR, formatDate, formatDateTime } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Printer,
  ArrowLeft,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  FileCheck,
} from 'lucide-react';

export default function InvoicePage() {
  const { identifier } = useParams();
  const { isAdmin } = useAuth();
  const { addToast } = useToast();

  const [invoice, setInvoice] = useState(null);
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState(false);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/invoices/${identifier}`);
      if (res.data?.success) {
        setInvoice(res.data.invoice);
        setAdjustments(res.data.adjustments || []);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve invoice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [identifier]);

  const handlePrint = () => {
    window.print();
  };

  const handleApproveBill = async () => {
    if (!invoice?._id) return;
    try {
      setApproving(true);
      const res = await api.post(`/invoices/${invoice._id}/approve`);
      if (res.data?.success) {
        addToast('Invoice successfully approved and marked as Final Official Bill!', 'success');
        setInvoice(res.data.invoice);
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to approve invoice', 'error');
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <Loader2 size={36} className="animate-spin" color="#C98491" style={{ margin: '0 auto 1rem' }} />
        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#5C5552' }}>
          Generating bill document...
        </p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif' }}>Bill Unavailable</h2>
        <p style={{ color: '#D32F2F', margin: '1rem 0' }}>{error || 'Invoice not found.'}</p>
        <Link to="/orders" className="btn btn-primary">Return to My Orders</Link>
      </div>
    );
  }

  const isPending = invoice.approvalStatus === 'PENDING';
  const isApproved = invoice.approvalStatus === 'APPROVED';

  // Format dates matching sample
  const issuedDate = formatDate(invoice.date || invoice.createdAt);
  const dueDate = formatDate(new Date(new Date(invoice.createdAt || Date.now()).getTime() + 10 * 24 * 60 * 60 * 1000));

  return (
    <div className="invoice-page-container" style={{ backgroundColor: '#F8F5F2', minHeight: '100vh', padding: '2.5rem 0 5rem' }}>
      <style>{`
        @media print {
          body, html {
            background-color: #FFFFFF !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          nav, header, footer, .no-print, .btn, .announcement-bar, .admin-alert-banner {
            display: none !important;
          }
          .invoice-page-container {
            background-color: #FFFFFF !important;
            padding: 0 !important;
          }
          #invoice-sheet {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .invoice-blush-box {
            background-color: #F7EFEA !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
        }
      `}</style>

      <div className="container" style={{ maxWidth: '850px', margin: '0 auto', padding: '0 1rem' }}>
        
        {/* Navigation & Action Toolbar (Screen Only) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <Link
            to="/orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#5C5552',
              fontSize: '0.9rem',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} /> Back to My Orders
          </Link>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Admin Quick Approval Action */}
            {isAdmin && isPending && (
              <button
                onClick={handleApproveBill}
                disabled={approving}
                className="btn btn-sm"
                style={{
                  backgroundColor: '#2E7D32',
                  color: '#FFFFFF',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 600,
                  cursor: approving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 4px rgba(46, 125, 50, 0.2)',
                }}
              >
                {approving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                Approve & Finalize Bill
              </button>
            )}

            {/* Print / Save PDF Button */}
            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#262322',
                borderColor: '#262322',
                color: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              }}
            >
              <Printer size={16} /> Download Bill (PDF) / Print
            </button>
          </div>
        </div>

        {/* Customer Status Notice Banner (Screen Only) */}
        {isPending ? (
          <div
            className="no-print admin-alert-banner"
            style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '8px',
              padding: '0.9rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              color: '#92400E',
              fontSize: '0.875rem',
              boxShadow: '0 2px 5px rgba(245, 158, 11, 0.08)',
            }}
          >
            <Clock size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#D97706' }} />
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '0.9rem' }}>Provisional Bill — Pending Boutique Approval</strong>
              <p style={{ marginTop: '0.2rem', color: '#78350F', lineHeight: '1.45' }}>
                Your order is currently placed and under review by Jashvi Boutique administration. This document is your provisional bill. As soon as the boutique confirms and approves your order, this bill will automatically update to your <strong>Final Verified Tax Invoice</strong>.
              </p>
              {isAdmin && (
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#B45309', fontWeight: 600 }}>
                    ★ Logged in as Admin: You can click the green "Approve & Finalize Bill" button above to approve now.
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            className="no-print admin-alert-banner"
            style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              padding: '0.75rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: '#166534',
              fontSize: '0.875rem',
            }}
          >
            <CheckCircle2 size={18} color="#16A34A" />
            <div>
              <strong>Final Verified Tax Invoice:</strong> Approved by Boutique Admin
              {invoice.approvedAt && ` on ${formatDateTime(invoice.approvedAt)}`}. This is your official commercial tax bill.
            </div>
          </div>
        )}

        {/* Printable Invoice Paper Sheet (Styled exactly like user reference sample) */}
        <div
          id="invoice-sheet"
          style={{
            position: 'relative',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            padding: '3.5rem 3.5rem 2.5rem',
            color: '#1A1817',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            overflow: 'hidden',
          }}
        >
          {/* Watermark for Pending Approval */}
          {isPending && (
            <div
              style={{
                position: 'absolute',
                top: '46%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-25deg)',
                fontSize: '3.2rem',
                fontWeight: 900,
                color: 'rgba(217, 119, 6, 0.11)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                pointerEvents: 'none',
                border: '5px dashed rgba(217, 119, 6, 0.22)',
                padding: '1.25rem 2.5rem',
                borderRadius: '12px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                userSelect: 'none',
                zIndex: 0,
              }}
            >
              PENDING APPROVAL
              <div style={{ fontSize: '1.2rem', letterSpacing: '0.25em', marginTop: '0.25rem' }}>
                PROVISIONAL BILL
              </div>
            </div>
          )}

          {/* Top Section: INVOICE Title, Dates, Parties & Boutique Logo Circle */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '2rem',
              marginBottom: '2.5rem',
            }}
          >
            {/* Left Header Column */}
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '3.2rem',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  color: '#1A1817',
                  margin: '0 0 0.5rem 0',
                  lineHeight: '1',
                  textTransform: 'uppercase',
                }}
              >
                INVOICE
              </h1>

              {/* Status Stamp / Pill */}
              <div style={{ margin: '0.5rem 0 1.25rem' }}>
                {isPending ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      backgroundColor: '#FEF3C7',
                      color: '#B45309',
                      border: '1px solid #FCD34D',
                      textTransform: 'uppercase',
                    }}
                  >
                    <Clock size={12} /> Pending Admin Approval • Provisional Bill
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      backgroundColor: '#DCFCE7',
                      color: '#15803D',
                      border: '1px solid #86EFAC',
                      textTransform: 'uppercase',
                    }}
                  >
                    <ShieldCheck size={12} /> Final Approved Tax Invoice
                  </span>
                )}
              </div>

              {/* Issued & Due Dates */}
              <div
                style={{
                  display: 'flex',
                  gap: '2.5rem',
                  fontSize: '0.85rem',
                  color: '#4A4644',
                  marginBottom: '2rem',
                }}
              >
                <div>
                  <span style={{ color: '#7A736F' }}>Issued: </span>
                  <strong>{issuedDate}</strong>
                </div>
                <div>
                  <span style={{ color: '#7A736F' }}>Due: </span>
                  <strong>{dueDate}</strong>
                </div>
              </div>

              {/* BILL TO & FROM Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.875rem' }}>
                {/* BILL TO */}
                <div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      color: '#1A1817',
                      textTransform: 'uppercase',
                      marginBottom: '0.3rem',
                    }}
                  >
                    BILL TO:
                  </div>
                  <div style={{ fontWeight: 600, color: '#1A1817' }}>
                    {invoice.deliveryAddress?.fullName || invoice.customerInfo?.name || 'Customer'}
                  </div>
                  <div style={{ color: '#55504D', lineHeight: '1.45' }}>
                    {invoice.deliveryAddress?.phone || invoice.customerInfo?.phone || '+91-XXXXXXXXXX'}
                  </div>
                  <div style={{ color: '#55504D', lineHeight: '1.45', maxWidth: '340px' }}>
                    {invoice.deliveryAddress?.addressLine ? (
                      <>
                        {invoice.deliveryAddress.addressLine}, {invoice.deliveryAddress.city}, {invoice.deliveryAddress.state} - {invoice.deliveryAddress.pincode}
                      </>
                    ) : (
                      'Attavara, Mangalore'
                    )}
                  </div>
                </div>

                {/* FROM */}
                <div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      color: '#1A1817',
                      textTransform: 'uppercase',
                      marginBottom: '0.3rem',
                    }}
                  >
                    FROM:
                  </div>
                  <div style={{ fontWeight: 600, color: '#1A1817' }}>
                    {invoice.boutiqueInfo?.name || 'Jashvi Boutique'}
                  </div>
                  <div style={{ color: '#55504D', lineHeight: '1.45' }}>
                    +91 {invoice.boutiqueInfo?.phone || '8050853393'}
                  </div>
                  <div style={{ color: '#55504D', lineHeight: '1.45', maxWidth: '340px' }}>
                    #G1, Ground Floor, Bloom Residency, Victor Bishop Road, Attavara, Mangalore, Karnataka 575001
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Circular Boutique Badge with Sewing Machine Graphic */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <div
                className="invoice-blush-box"
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  backgroundColor: '#F5ECE8',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.25rem',
                  textAlign: 'center',
                  boxShadow: 'inset 0 0 0 1px rgba(197, 160, 148, 0.25)',
                }}
              >
                {/* Sewing Machine Silhouette Vector Icon matching sample */}
                <svg
                  width="72"
                  height="46"
                  viewBox="0 0 90 58"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginBottom: '0.5rem' }}
                >
                  {/* Spool pin and spool */}
                  <rect x="58" y="4" width="3" height="9" fill="#1A1817" />
                  <rect x="54" y="6" width="11" height="7" rx="1.5" fill="#1A1817" />
                  {/* Machine Body Arm */}
                  <path
                    d="M 22 17 C 22 14, 25 12, 29 12 L 67 12 C 72 12, 75 15, 75 20 L 75 46 C 75 48, 73 50, 71 50 L 61 50 C 59 50, 57 48, 57 46 L 57 26 C 57 24, 55 22, 53 22 L 29 22 C 25 22, 22 25, 22 29 L 22 36 L 16 36 L 16 23 C 16 19, 18 17, 22 17 Z"
                    fill="#1A1817"
                  />
                  {/* Flywheel / Handwheel */}
                  <rect x="76" y="22" width="5" height="20" rx="2.5" fill="#1A1817" />
                  <path d="M 81 30 L 86 30 L 86 33 L 81 33 Z" fill="#1A1817" />
                  <circle cx="86" cy="31.5" r="2.5" fill="#1A1817" />
                  {/* Needle bar & Needle */}
                  <rect x="25" y="32" width="2" height="15" fill="#1A1817" />
                  {/* Presser foot */}
                  <path d="M 23 46 L 29 46 L 27 47 L 23 47 Z" fill="#1A1817" />
                  {/* Base Plate */}
                  <rect x="10" y="49" width="70" height="5" rx="2" fill="#1A1817" />
                </svg>

                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: '#1A1817',
                    textTransform: 'uppercase',
                    lineHeight: '1.2',
                  }}
                >
                  JASHVI
                </div>
                <div
                  style={{
                    fontSize: '0.6rem',
                    letterSpacing: '0.18em',
                    color: '#706864',
                    textTransform: 'uppercase',
                    marginTop: '2px',
                    fontWeight: 600,
                  }}
                >
                  BOUTIQUE ATELIER
                </div>
              </div>

              {/* Order Reference Badge below logo */}
              <div style={{ marginTop: '0.85rem', textAlign: 'center', fontSize: '0.75rem', color: '#7A736F' }}>
                <div>Invoice: <strong>{invoice.invoiceNumber}</strong></div>
                <div>Order: <strong>{invoice.orderNumber}</strong></div>
              </div>
            </div>
          </div>

          {/* Itemized Table (Matching Sample Design: Blush tint header, clean row lines) */}
          <div style={{ position: 'relative', zIndex: 1, marginBottom: '2.5rem' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr
                  className="invoice-blush-box"
                  style={{
                    backgroundColor: '#F5ECE8',
                    color: '#1A1817',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  <th style={{ padding: '0.9rem 1.25rem', width: '50%' }}>DESCRIPTION</th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'center', width: '15%' }}>QTY</th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'right', width: '17%' }}>PRICE</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right', width: '18%' }}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, idx) => {
                  const qtyFormatted = String(item.quantity || 1).padStart(2, '0');
                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #ECE6E1',
                        fontSize: '0.875rem',
                      }}
                    >
                      <td style={{ padding: '1.1rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: '#1A1817', marginBottom: '0.2rem' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#7A736F' }}>
                          {item.size ? `Size: ${item.size}` : ''}
                          {item.size && item.color ? ' • ' : ''}
                          {item.color ? `Color: ${item.color}` : ''}
                          {item.sku ? ` • SKU: ${item.sku}` : ''}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '1.1rem 1rem',
                          textAlign: 'center',
                          color: '#4A4644',
                          fontWeight: 500,
                        }}
                      >
                        {qtyFormatted}
                      </td>
                      <td
                        style={{
                          padding: '1.1rem 1rem',
                          textAlign: 'right',
                          color: '#4A4644',
                        }}
                      >
                        {formatINR(item.unitPrice)}
                      </td>
                      <td
                        style={{
                          padding: '1.1rem 1.25rem',
                          textAlign: 'right',
                          fontWeight: 600,
                          color: '#1A1817',
                        }}
                      >
                        {formatINR(item.lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals Section (Right-aligned, matching sample) */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '3rem',
            }}
          >
            <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#4A4644' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 500 }}>{formatINR(invoice.pricing?.subtotal || 0)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: invoice.pricing?.discount > 0 ? '#15803D' : '#4A4644' }}>
                <span>Discount {invoice.pricing?.couponCode ? `(${invoice.pricing.couponCode})` : ''}</span>
                <span>{invoice.pricing?.discount > 0 ? `- ${formatINR(invoice.pricing.discount)}` : '—'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#4A4644' }}>
                <span>Delivery</span>
                <span>{invoice.pricing?.deliveryCharge > 0 ? formatINR(invoice.pricing.deliveryCharge) : 'FREE'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#7A736F' }}>
                <span>Tax (GST)</span>
                <span>Included</span>
              </div>

              {/* Separator line */}
              <div style={{ borderTop: '1px solid #1A1817', margin: '0.35rem 0' }} />

              {/* TOTAL in Bold */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#1A1817',
                  letterSpacing: '0.04em',
                }}
              >
                <span style={{ textTransform: 'uppercase' }}>TOTAL</span>
                <span style={{ fontSize: '1.4rem' }}>{formatINR(invoice.pricing?.finalTotal || 0)}</span>
              </div>

              {/* Payment Details Pill */}
              <div style={{ textAlign: 'right', marginTop: '0.25rem', fontSize: '0.75rem', color: '#7A736F' }}>
                Method: <strong>{invoice.paymentInfo?.method || 'Card/UPI'}</strong> • Status:{' '}
                <strong style={{ color: invoice.paymentInfo?.status === 'PAID' ? '#15803D' : '#B45309' }}>
                  {invoice.paymentInfo?.status || 'PENDING'}
                </strong>
              </div>
            </div>
          </div>

          {/* Bottom Full-Width Banner: "Thank you!" on left, Contact info on right */}
          <div
            className="invoice-blush-box"
            style={{
              position: 'relative',
              zIndex: 1,
              backgroundColor: '#F5ECE8',
              borderRadius: '6px',
              padding: '1.25rem 2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            {/* Left: Thank you! in Playfair Display serif italic */}
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '1.85rem',
                fontStyle: 'italic',
                fontWeight: 600,
                color: '#1A1817',
              }}
            >
              Thank you!
            </div>

            {/* Right: Contact details */}
            <div
              style={{
                textAlign: 'right',
                fontSize: '0.78rem',
                color: '#55504D',
                lineHeight: '1.5',
              }}
            >
              <div>contact@jashviboutique.com</div>
              <div>www.jashviboutique.com</div>
              <div>+91 80508 53393</div>
            </div>
          </div>

          {/* Administrative Adjustment Log Trail (Screen only, for transparency) */}
          {adjustments.length > 0 && (
            <div
              className="no-print"
              style={{
                marginTop: '2.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px dashed #C98491',
                fontSize: '0.8rem',
              }}
            >
              <h4 style={{ color: '#854D0E', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Administrative Adjustments Audit Trail
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {adjustments.map((a) => (
                  <div
                    key={a._id}
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#FEF9C3',
                      borderRadius: '4px',
                      color: '#713F12',
                    }}
                  >
                    <strong>{a.fieldAdjusted}:</strong> {formatINR(a.previousValue)} → {formatINR(a.newValue)} ({a.reason})
                    <span style={{ fontSize: '0.7rem', color: '#A16207', marginLeft: '0.5rem' }}>
                      by {a.adminEmail} on {formatDate(a.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
