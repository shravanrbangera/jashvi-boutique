import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      addToast(res.data?.message || 'Password reset instructions simulated.', 'info');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F7F4F0', padding: '4rem 0 6rem', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '440px' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #EAE7E4',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <Link
            to="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#5C5552', marginBottom: '1.5rem', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={15} /> Back to Sign In
          </Link>

          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Reset Password</h1>
          <p style={{ color: '#5C5552', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Enter your registered email address to receive password assistance.
          </p>

          {submitted ? (
            <div style={{ backgroundColor: '#FDF8F9', padding: '1.5rem', borderRadius: '8px', border: '1px solid #F1DFE2', textAlign: 'center' }}>
              <CheckCircle2 size={32} color="#C98491" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.9rem', color: '#262322', fontWeight: 600 }}>
                Instructions Sent
              </p>
              <p style={{ fontSize: '0.85rem', color: '#5C5552', marginTop: '0.4rem' }}>
                If an account matches <strong>{email}</strong>, our boutique support team has noted your request. You can also call <strong>8050853393</strong> for expedited support.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="name@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', justifyContent: 'center' }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Instructions'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
