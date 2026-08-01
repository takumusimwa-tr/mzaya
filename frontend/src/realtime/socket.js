/**
 * MZAYA browser Socket.IO singleton.
 *
 * Requires `socket.io-client` in frontend dependencies.
 */
import { io } from 'socket.io-client'

let socket = null

function apiOrigin() {
  const configured = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL
  if (configured) return configured.replace(/\/api\/?$/, '')
  return 'http://localhost:5000'
}

export function getSocket(token) {
  if (!token) return null

  if (!socket) {
    socket = io(apiOrigin(), {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      auth: { token },
    })
    attachPending(socket)
  } else {
    socket.auth = { token }
  }

  return socket
}

export function connectSocket(token) {
  const instance = getSocket(token)
  if (instance && !instance.connected) instance.connect()
  return instance
}

export function disconnectSocket() {
  if (socket) socket.disconnect()
}

// ─── Default export: a safe delegating proxy ─────────────────────────────────
//
// Eleven realtime hooks do `import socket from '../realtime/socket'` and call
// socket.on/emit directly. This module previously had NO default export, so every
// one of them received `undefined` and crashed on first use.
//
// Rather than rewrite eleven call sites, export a proxy that delegates to the
// live singleton. Listeners registered before login (before the socket exists)
// are buffered and attached the moment the socket is created, so nothing is
// silently dropped.
const pendingListeners = []

function attachPending(instance) {
  while (pendingListeners.length) {
    const { event, handler } = pendingListeners.shift()
    instance.on(event, handler)
  }
}

const socketProxy = {
  on(event, handler) {
    if (socket) socket.on(event, handler)
    else pendingListeners.push({ event, handler })
  },
  off(event, handler) {
    if (socket) socket.off(event, handler)
    const i = pendingListeners.findIndex((p) => p.event === event && p.handler === handler)
    if (i !== -1) pendingListeners.splice(i, 1)
  },
  emit(event, payload) {
    if (socket) socket.emit(event, payload)
    // No socket yet → nothing to emit to; realtime emits are best-effort.
  },
  get connected() {
    return Boolean(socket?.connected)
  },
}

export default socketProxy

// ─── Room helpers ─────────────────────────────────────────────────────────────
// The backend authorizes these joins per-user (order.socket.js): vendors may
// join their own vendor room, riders their city's. Payload is the bare id.
export function joinVendor(vendorId)  { if (vendorId) socketProxy.emit('join:vendor',  vendorId) }
export function leaveVendor(vendorId) { if (vendorId) socketProxy.emit('leave:vendor', vendorId) }
export function joinCity(cityId)      { if (cityId)   socketProxy.emit('join:city',    cityId) }
export function leaveCity(cityId)     { if (cityId)   socketProxy.emit('leave:city',   cityId) }

export function resetSocket() {
  if (socket) socket.disconnect()
  socket = null
}
