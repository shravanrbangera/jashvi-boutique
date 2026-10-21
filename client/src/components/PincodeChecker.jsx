import React, { useState } from 'react';
import api from '../services/api';
import { Truck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function PincodeChecker({ onPincodeValidated }) {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) {
      setResult({
        serviceable: false,
        message: 'Please enter a valid 6-digit Indian PIN code.',
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      const res = await api.post('/delivery/check', { pincode });
      setResult(res.data);
      if (onPincodeValidated && res.data.serviceable) {
        onPincodeValidated(res.data);
      }
    } catch (err) {
      setResult({
        serviceable: false,
        message: err.message || 'Delivery service check failed.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: '#FDFBF9', border: '1px solid #EAE7E4', borderRadius: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: 600 }}>
        <Truck size={17} color="#C98491" />
        <span>Check Delivery Availability</span>
      </div>

      <form onSubmit={handleCheck} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          maxLength={6}
          placeholder="Enter 6-digit PIN code (e.g. 575001)"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
          className="form-input"
          style={{ flex: 1, padding: '0.55rem 0.85rem', fontSize: '0.9rem' }}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading || pincode.length !== 6}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Check'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
          {result.serviceable ? (
            <div style={{ color: '#2E7D32', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontWeight: 600 }}>
                  Delivery available to {result.city}, {result.state} ({result.pincode})
                </p>
                <p style={{ color: '#5C5552', marginTop: '2px' }}>
                  Shipping Fee: <strong>{result.deliveryCharge === 0 ? 'FREE' : formatINR(result.deliveryCharge)}</strong> | Est. Arrival: <strong>{result.estimatedDays}</strong>
                </p>
              </div>
            </div>
          ) : (
            <div style={{ color: '#D32F2F', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{result.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
