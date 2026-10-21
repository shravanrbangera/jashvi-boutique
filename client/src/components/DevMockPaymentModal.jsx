import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, ShieldAlert, Loader2 } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function DevMockPaymentModal({ isOpen, orderDetails, onPaymentSuccess, onPaymentCancel }) {
  const [processing, setProcessing] = useState(false);

  if (!isOpen || !orderDetails) return null;

  const handleSimulate = async (shouldSucceed) => {
    setProcessing(true);
    // Simulate gateway delay
    setTimeout(() => {
      setProcessing(false);
      if (shouldSucceed) {
        onPaymentSuccess({
          paymentId: `mock_pay_${Date.now()}`,
          signature: 'mock_signature_dev_sandbox',
        });
      } else {
        onPaymentCancel('Payment cancelled by customer during simulation.');
      }
    }, 800);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#FFF3E0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <ShieldAlert size={28} color="#E65100" />
          </div>

          <span
            style={{
              display: 'inline-block',
              backgroundColor: '#FFE0B2',
              color: '#BF360C',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              marginBottom: '0.5rem',
            }}
          >
            DEVELOPMENT MOCK PAYMENT GATEWAY
          </span>

          <h3 style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>
            Simulate Online Transaction
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#8A817D', marginTop: '0.25rem' }}>
            Safe Sandbox Mode — No real bank accounts or funds are involved.
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#FDFBF9',
            border: '1px solid #EAE7E4',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#5C5552' }}>Boutique Merchant:</span>
            <strong>Jashvi Boutique</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#5C5552' }}>Order Reference:</span>
            <strong>{orderDetails.orderNumber}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#5C5552' }}>Customer Name:</span>
            <span>{orderDetails.customerName || 'Boutique Customer'}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '0.5rem',
              borderTop: '1px solid #EAE7E4',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#262322',
            }}
          >
            <span>Total Payable:</span>
            <span>{formatINR(orderDetails.amount)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ backgroundColor: '#2E7D32', borderColor: '#2E7D32', width: '100%' }}
            onClick={() => handleSimulate(true)}
            disabled={processing}
          >
            {processing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <CheckCircle size={18} /> Simulate Successful Payment (Order Confirmed)
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', color: '#D32F2F', borderColor: '#FFCDD2' }}
            onClick={() => handleSimulate(false)}
            disabled={processing}
          >
            <XCircle size={18} /> Simulate Payment Failure / Abandon
          </button>
        </div>

        <p
          style={{
            fontSize: '0.75rem',
            color: '#8A817D',
            textAlign: 'center',
            marginTop: '1.25rem',
            lineHeight: 1.4,
          }}
        >
          Note: In production, once Razorpay credentials are added to <code>server/.env</code>, this modal automatically transitions into the official Razorpay checkout.
        </p>
      </div>
    </div>
  );
}
