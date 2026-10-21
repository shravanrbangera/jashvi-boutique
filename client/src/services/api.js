import axios from 'axios';

// Ensure a persistent guest ID exists for guest browsing / temporary bag
function getOrCreateGuestId() {
  let guestId = localStorage.getItem('jashvi_guest_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    localStorage.setItem('jashvi_guest_id', guestId);
  }
  return guestId;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject Authorization header and guestId header
api.interceptors.request.use(
  (config) => {
    const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const adminToken = localStorage.getItem('jashvi_admin_token');
    const customerToken = localStorage.getItem('jashvi_token');

    // Prioritize adminToken when accessing /admin routes to prevent customer sessions from interfering
    const token = isAdminPath ? (adminToken || customerToken) : (customerToken || adminToken);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['x-guest-id'] = getOrCreateGuestId();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
export { getOrCreateGuestId };
