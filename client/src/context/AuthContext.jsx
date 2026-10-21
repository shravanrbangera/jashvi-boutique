import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('jashvi_token'));
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // Load user profile on mount if token exists
  useEffect(() => {
    async function loadUser() {
      const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      const storedAdminToken = localStorage.getItem('jashvi_admin_token');
      const storedCustomerToken = localStorage.getItem('jashvi_token');
      const activeToken = isAdminPath ? (storedAdminToken || storedCustomerToken) : (storedCustomerToken || storedAdminToken);

      if (activeToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.user);
            if (res.data.user.role === 'admin') {
              localStorage.setItem('jashvi_admin_token', activeToken);
            }
          }
        } catch (err) {
          console.warn('[Auth] Session expired or invalid:', err.message);
          if (isAdminPath) {
            localStorage.removeItem('jashvi_admin_token');
          } else {
            localStorage.removeItem('jashvi_token');
          }
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { token: newToken, user: newUser } = res.data;
        if (newUser.role === 'admin') {
          localStorage.setItem('jashvi_admin_token', newToken);
        } else {
          localStorage.setItem('jashvi_token', newToken);
        }
        setToken(newToken);
        setUser(newUser);
        addToast(res.data.message || `Welcome back, ${newUser.name}!`, 'success');

        // Merge guest cart if any
        const guestId = localStorage.getItem('jashvi_guest_id');
        if (guestId) {
          try {
            await api.post('/cart/merge', { guestId });
          } catch (mergeErr) {
            console.warn('[Cart merge notice]', mergeErr.message);
          }
        }

        return { success: true, user: newUser };
      }
    } catch (err) {
      addToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, phone, password });
      if (res.data?.success) {
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('jashvi_token', newToken);
        setToken(newToken);
        setUser(newUser);
        addToast('Account created successfully! Welcome to Jashvi Boutique.', 'success');

        // Merge guest cart if any
        const guestId = localStorage.getItem('jashvi_guest_id');
        if (guestId) {
          try {
            await api.post('/cart/merge', { guestId });
          } catch (mergeErr) {
            console.warn('[Cart merge notice]', mergeErr.message);
          }
        }

        return { success: true, user: newUser };
      }
    } catch (err) {
      addToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
    }
    const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    if (isAdminPath) {
      localStorage.removeItem('jashvi_admin_token');
    } else {
      localStorage.removeItem('jashvi_token');
    }
    setToken(null);
    setUser(null);
    addToast('You have been logged out.', 'info');
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.warn('Failed to refresh profile:', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
