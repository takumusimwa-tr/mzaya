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
  list:    (params) => api.get('/vendors', { params }),
  getById: (id)     => api.get(`/vendors/${id}`),
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
};

// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentAPI = {
  initiate:    (id, data) => api.post(`/payments/${id}/pay`, data),
  checkStatus: (id)       => api.get(`/payments/${id}/status`),
};

export default api;
