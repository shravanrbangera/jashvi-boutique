import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '380px',
          width: 'calc(100% - 3rem)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              padding: '0.9rem 1.15rem',
              backgroundColor: '#262322',
              color: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              fontSize: '0.9rem',
              lineHeight: 1.4,
              animation: 'fadeIn 0.25s ease-out',
              borderLeft: `4px solid ${
                toast.type === 'success' ? '#4CAF50' : toast.type === 'error' ? '#EF5350' : '#C98491'
              }`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {toast.type === 'success' && <CheckCircle2 size={18} color="#4CAF50" />}
              {toast.type === 'error' && <AlertCircle size={18} color="#EF5350" />}
              {toast.type === 'info' && <Info size={18} color="#C98491" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ color: '#A09893', padding: '2px', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      addToast: (msg) => console.log('[Toast fallback]', msg),
    };
  }
  return context;
}
