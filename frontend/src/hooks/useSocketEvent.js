// frontend/src/hooks/useSocketEvent.js
import { useEffect } from 'react'
import { getSocket } from '../realtime/socket'

// Subscribe to a socket event for the lifetime of a component.
// handler should be stable or wrapped — we re-bind when deps change.
export default function useSocketEvent(event, handler, deps = []) {
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    socket.on(event, handler)
    return () => socket.off(event, handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps])
}
