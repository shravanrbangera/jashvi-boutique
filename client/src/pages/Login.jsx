import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Lock, Mail, ArrowRight, ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (res?.success) {
      if (res.user?.role === 'admin' && redirectPath === '/') {
        navigate('/admin');
      } else {
        navigate(redirectPath);
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#F7F4F0', padding: '4rem 0 6rem', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '460px' }}>
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
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Welcome Back</h1>
            <p style={{ color: '#5C5552', fontSize: '0.9rem' }}>
              Sign in to manage your bag, track orders, or access your boutique account.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#C98491' }}>
                  Forgot Password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', justifyContent: 'center', marginTop: '0.5rem' }}
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#5C5552' }}>
            New to Jashvi Boutique?{' '}
            <Link to={`/register?redirect=${redirectPath}`} style={{ color: '#C98491', fontWeight: 600 }}>
              Create an account
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #EAE7E4' }}>
            <Link to="/products" style={{ fontSize: '0.85rem', color: '#8A817D', textDecoration: 'none' }}>
              &larr; Continue shopping as guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
