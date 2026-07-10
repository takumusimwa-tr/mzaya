import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Attach token to every request ───────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mzaya_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Handle 401 globally ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mzaya_token');
      localStorage.removeItem('mzaya_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orderAPI = {
  place:        (data)       => api.post('/orders', data),
  quote:        (data)       => api.post('/orders/quote', data),
  myOrders:     ()           => api.get('/orders/my'),
  getOrder:     (id)         => api.get(`/orders/${id}`),
  cancel:       (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
};

// ─── Vendors ──────────────────────────────────────────────────────────────────
export const vendorAPI = {
  list:     (params) => api.get('/vendors', { params }),
  getById:  (id)     => api.get(`/vendors/${id}`),
  register: (data)   => api.post('/vendors', data),   // self-onboarding
  my:       (branchId) => api.get('/vendors/my', { params: branchId ? { branch_id: branchId } : {} }),
  branches:  ()       => api.get('/vendors/my/branches'),
  addBranch: (data)   => api.post('/vendors/my/branches', data),
};

// ─── Cities ───────────────────────────────────────────────────────────────────
export const cityAPI = {
  list: () => api.get('/cities'),
};

// ─── Riders ──────────────────────────────────────────────────────────────────
export const riderAPI = {
  getProfile:  ()     => api.get('/riders/profile'),
  saveProfile: (data) => api.put('/riders/profile', data),
  setOnline:   (on)   => api.patch('/riders/online', { is_online: on }),
};

// ─── Vehicles ─────────────────────────────────────────────────────────────────
export const vehicleAPI = {
  list: () => api.get('/vehicles'),
};

// ─── Geo — resolve WhatsApp/Maps location pins ───────────────────────────────
export const geoAPI = {
  resolvePin: (link) => api.post('/geo/resolve-pin', { link }),
};

// ─── Promos ───────────────────────────────────────────────────────────────────
export const promoAPI = {
  validate: (payload) => api.post('/promos/validate', payload),
  list:     () => api.get('/promos'),
  create:   (data) => api.post('/promos', data),
  update:   (id, data) => api.patch(`/promos/${id}`, data),
  remove:   (id) => api.delete(`/promos/${id}`),
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  overview:      () => api.get('/admin/overview'),
  vendors:       (status) => api.get(`/admin/vendors?status=${status || 'all'}`),
  approveVendor: (id) => api.patch(`/admin/vendors/${id}/approve`),
  rejectVendor:  (id) => api.patch(`/admin/vendors/${id}/reject`),
  riders:        (status) => api.get(`/admin/riders?status=${status || 'all'}`),
  approveRider:  (id) => api.patch(`/admin/riders/${id}/approve`),
  liveOrders:    () => api.get('/admin/orders/live'),
}

// ─── Fare negotiation ─────────────────────────────────────────────────────────
export const negotiationAPI = {
  // Customer
  offers:      (orderId) => api.get(`/orders/${orderId}/offers`),
  chooseOffer: (orderId, offerId) => api.post(`/orders/${orderId}/offers/${offerId}/choose`),
  // Rider
  negotiable:  () => api.get('/orders/negotiable'),
  makeOffer:   (orderId, data) => api.post(`/orders/${orderId}/offers`, data),
}

// ─── Browse (customer home) ───────────────────────────────────────────────────
export const browseAPI = {
  // Brand-first (food/errands)
  brands:   ({ category, city_id, lat, lng }) => {
    const p = new URLSearchParams({ category, city_id, ...(lat && { lat }), ...(lng && { lng }) })
    return api.get(`/browse/brands?${p.toString()}`)
  },
  // Product-first (materials/grocery)
  products: ({ category, city_id, q, lat, lng }) => {
    const p = new URLSearchParams({ category, city_id, ...(q && { q }), ...(lat && { lat }), ...(lng && { lng }) })
    return api.get(`/browse/products?${p.toString()}`)
  },
};

// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentAPI = {
  initiate: (id, data) => api.post(`/payments/${id}/pay`, data),
  poll:     (id)       => api.get(`/payments/${id}/poll`),
};

export default api;
