import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      if (res.data?.success) {
        setWishlistItems(res.data.products || []);
      }
    } catch (err) {
      console.warn('Failed to load wishlist:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      addToast('Please log in to save items to your wishlist.', 'info');
      return false;
    }

    try {
      const res = await api.post('/wishlist/toggle', { productId });
      if (res.data?.success) {
        addToast(res.data.message, res.data.isAdded ? 'success' : 'info');
        await fetchWishlist();
        return res.data.isAdded;
      }
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => (item._id || item) === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        toggleWishlist,
        isInWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
