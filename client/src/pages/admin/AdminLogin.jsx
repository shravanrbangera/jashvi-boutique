import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, Lock, Mail, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [email, setEmail] = useState('admin@jashviboutique.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res?.success) {
      if (res.user?.role === 'admin') {
        navigate('/admin');
      } else {
        addToast('Access denied: Customer accounts cannot access the administrative dashboard.', 'error');
      }
    }
  };

  const fillDefaultCredentials = () => {
    setEmail('admin@jashviboutique.com');
    setPassword('JashviAdmin@2026!');
  };

  return (
    <div
      style={{
        backgroundColor: '#1E1B1A',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#262322',
          border: '1px solid #3D3734',
          borderRadius: '12px',
          maxWidth: '440px',
          width: '100%',
          padding: '2.5rem',
          boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
          color: '#FFFFFF',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/assets/images/jashvi-logo.png"
            alt="Jashvi Boutique"
            style={{ height: '54px', margin: '0 auto 1rem', filter: 'brightness(1.1)' }}
          />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#C98491',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            <ShieldCheck size={16} /> Restricted Admin Portal
          </div>

          <h1 style={{ fontSize: '1.75rem', color: '#FFFFFF', marginBottom: '0.25rem' }}>
            Boutique Management
          </h1>
          <p style={{ color: '#A09893', fontSize: '0.85rem' }}>
            Authorized personnel only. All access attempts are monitored and audited.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ color: '#D5CFC9' }}>
              Administrator Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              style={{ backgroundColor: '#1E1B1A', borderColor: '#423C39', color: '#FFFFFF' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#D5CFC9' }}>
              Master Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                style={{ backgroundColor: '#1E1B1A', borderColor: '#423C39', color: '#FFFFFF', paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#A09893',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{
              width: '100%',
              backgroundColor: '#C98491',
              borderColor: '#C98491',
              padding: '0.85rem',
              justifyContent: 'center',
              marginTop: '0.5rem',
            }}
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Authenticate & Enter Dashboard'}
          </button>
        </form>

        {/* Development Seed Helper */}
        <div
          style={{
            marginTop: '1.75rem',
            padding: '1rem',
            backgroundColor: '#1E1B1A',
            border: '1px solid #383230',
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.75rem', color: '#8A817D', marginBottom: '0.5rem' }}>
            Preconfigured Admin Account:
          </p>
          <button
            type="button"
            onClick={fillDefaultCredentials}
            className="btn btn-secondary btn-sm"
            style={{
              width: '100%',
              fontSize: '0.8rem',
              color: '#C98491',
              borderColor: '#4A413E',
              backgroundColor: '#262322',
            }}
          >
            Auto-Fill Admin Credentials (JashviAdmin@2026!)
          </button>
        </div>
      </div>
    </div>
  );
}
