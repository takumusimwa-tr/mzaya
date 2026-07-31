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

export function resetSocket() {
  if (socket) socket.disconnect()
  socket = null
}
