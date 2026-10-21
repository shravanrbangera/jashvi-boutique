import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    itemCount: 0,
    hasStockIssues: false,
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data?.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.warn('Failed to load cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, isAuthenticated]);

  const addToCart = async (productId, size, color, quantity = 1) => {
    try {
      setLoading(true);
      const res = await api.post('/cart/items', { productId, size, color, quantity });
      if (res.data?.success) {
        setCart(res.data.cart);
        addToast(res.data.message || 'Added to your shopping bag!', 'success');
        return { success: true };
      }
    } catch (err) {
      addToast(err.message, 'error');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await api.patch(`/cart/items/${itemId}`, { quantity });
      if (res.data?.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      if (res.data?.success) {
        setCart(res.data.cart);
        addToast('Item removed from shopping bag.', 'info');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const clearCart = () => {
    setCart({ items: [], subtotal: 0, itemCount: 0, hasStockIssues: false });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
