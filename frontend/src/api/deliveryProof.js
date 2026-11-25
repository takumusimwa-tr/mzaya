import api from './api'

const path = (id) => `/delivery-proof/orders/${encodeURIComponent(id)}`
export const deliveryProofAPI = {
  submit: (id, payload) => api.post(path(id), payload),
  read: (id, signal) => api.get(path(id), { signal }),
  timeline: (id, signal) => api.get(`${path(id)}/timeline`, { signal }),
}
