import { useEffect } from 'react'
import useSocket from './useSocket'

export default function useOrderRealtime({
  token,
  orderId,
  onStatusChanged,
  onAssignmentChanged,
  onRiderLocation,
}) {
  const { socket, connected, connectionError } = useSocket(token)

  useEffect(() => {
    if (!socket || !orderId) return undefined

    socket.emit('join:order', orderId)

    const statusHandler = (payload) => {
      if (payload.orderId === orderId) onStatusChanged?.(payload)
    }
    const assignmentHandler = (payload) => {
      if (payload.orderId === orderId) onAssignmentChanged?.(payload)
    }
    const locationHandler = (payload) => {
      if (payload.orderId === orderId) onRiderLocation?.(payload)
    }

    socket.on('order:status_changed', statusHandler)
    socket.on('order:assignment_changed', assignmentHandler)
    socket.on('rider:location', locationHandler)

    return () => {
      socket.emit('leave:order', orderId)
      socket.off('order:status_changed', statusHandler)
      socket.off('order:assignment_changed', assignmentHandler)
      socket.off('rider:location', locationHandler)
    }
  }, [
    socket,
    orderId,
    onStatusChanged,
    onAssignmentChanged,
    onRiderLocation,
  ])

  return { connected, connectionError }
}
