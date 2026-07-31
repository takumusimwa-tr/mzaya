import { useEffect } from 'react'
import useSocket from './useSocket'

export default function useVendorLiveOrders({
  token,
  vendorId,
  onNewOrder,
  onOrderChanged,
}) {
  const { socket, connected, connectionError } = useSocket(token)

  useEffect(() => {
    if (!socket || !vendorId) return undefined

    socket.emit('join:vendor', vendorId)

    const newOrderHandler = (payload) => onNewOrder?.(payload)
    const changedHandler = (payload) => onOrderChanged?.(payload)

    socket.on('order:new', newOrderHandler)
    socket.on('order:status_changed', changedHandler)
    socket.on('order:assignment_changed', changedHandler)

    return () => {
      socket.emit('leave:vendor', vendorId)
      socket.off('order:new', newOrderHandler)
      socket.off('order:status_changed', changedHandler)
      socket.off('order:assignment_changed', changedHandler)
    }
  }, [socket, vendorId, onNewOrder, onOrderChanged])

  return { connected, connectionError }
}
