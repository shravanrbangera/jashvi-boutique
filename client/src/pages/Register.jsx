import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Lock, Mail, Phone, User, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setSubmitting(true);
    const res = await register(formData.name, formData.email, formData.phone, formData.password);
    setSubmitting(false);
    if (res?.success) {
      navigate(redirectPath);
    }
  };

  return (
    <div style={{ backgroundColor: '#F7F4F0', padding: '4rem 0 6rem', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #EAE7E4',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img
              src="/assets/images/jashvi-logo.png"
              alt="Jashvi Boutique"
              style={{ height: '52px', margin: '0 auto 1rem' }}
            />
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Create Account</h1>
            <p style={{ color: '#5C5552', fontSize: '0.9rem' }}>
              Join Jashvi Boutique for faster checkout, order tracking, and custom fitting updates.
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: '#FFEBEE',
                color: '#D32F2F',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                placeholder="e.g. Ananya Rao"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
                placeholder="ananya@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input"
                placeholder="10-digit mobile number"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="form-input"
                    placeholder="Min 6 characters"
                    style={{ paddingRight: '2.5rem' }}
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
                      color: '#8A817D',
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

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="form-input"
                    placeholder="Repeat password"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#8A817D',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', justifyContent: 'center', marginTop: '0.5rem' }}
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Register Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#5C5552' }}>
            Already have an account?{' '}
            <Link to={`/login?redirect=${redirectPath}`} style={{ color: '#C98491', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
