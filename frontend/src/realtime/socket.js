// frontend/src/realtime/socket.js
// Single Socket.IO client for the app. Connects once (after login) with the
// user's JWT, and lets screens subscribe to events.
import { io } from 'socket.io-client'

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:5000'

let socket = null

export function connectSocket(token) {
  if (socket?.connected) return socket
  if (socket) socket.disconnect()

  socket = io(API_ORIGIN, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  })

  socket.on('connect_error', (err) => {
    // Auth failures etc. — quiet, real-time is an enhancement not a hard dep.
    console.warn('[socket] connect error:', err.message)
  })

  return socket
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null }
}

export function getSocket() {
  return socket
}

// Room helpers
export function joinVendor(vendorId) { socket?.emit('join:vendor', vendorId) }
export function leaveVendor(vendorId) { socket?.emit('leave:vendor', vendorId) }
export function joinCity(cityId) { socket?.emit('join:city', cityId) }
export function leaveCity(cityId) { socket?.emit('leave:city', cityId) }
