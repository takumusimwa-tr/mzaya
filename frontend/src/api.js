import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Attach token to every request ───────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mzaya_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Handle 401 globally ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mzaya_token')
      localStorage.removeItem('mzaya_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orderAPI = {
  place:        (data)       => api.post('/orders', data),
  myOrders:     ()           => api.get('/orders/my'),
  vendorOrders: ()           => api.get('/orders/vendor'),
  getOrder:     (id)         => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  cancel:       (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
}

// ─── Vendors ──────────────────────────────────────────────────────────────────
export const vendorAPI = {
  list:       (params) => api.get('/vendors', { params }),
  getById:    (id)     => api.get(`/vendors/${id}`),
  my:         ()       => api.get('/vendors/my'),
  update:     (id, data) => api.put(`/vendors/${id}`, data),
  addItem:    (id, data) => api.post(`/vendors/${id}/menu`, data),
  updateItem: (id, itemId, data) => api.put(`/vendors/${id}/menu/${itemId}`, data),
  deleteItem: (id, itemId) => api.delete(`/vendors/${id}/menu/${itemId}`),
}

// ─── Riders ───────────────────────────────────────────────────────────────────
export const riderAPI = {
  profile:      ()       => api.get('/riders/profile'),
  toggleOnline: (online) => api.patch('/riders/online', { is_online: online }),
  updateLocation: (lat, lng) => api.patch('/riders/location', { lat, lng }),
}

// ─── Cities ───────────────────────────────────────────────────────────────────
export const cityAPI = {
  list: () => api.get('/cities'),
}

// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentAPI = {
  initiate:    (id, data) => api.post(`/payments/${id}/pay`, data),
  checkStatus: (id)       => api.get(`/payments/${id}/status`),
}

// ─── Analytics (proxied from ML service) ─────────────────────────────────────
export const analyticsAPI = {
  modelMetrics:   () => api.get('/analytics/model-metrics'),
  spendingTrends: (city) => api.get('/analytics/spending-trends', { params: { city } }),
  anomalies:      (limit) => api.get('/analytics/anomalies', { params: { limit } }),
  train:          () => api.post('/analytics/train'),
}

export default api
