import { useEffect } from 'react'
import useSocket from './useSocket'

export default function useAvailableOrdersRealtime({
  token,
  cityId,
  onAvailableOrder,
}) {
  const { socket, connected, connectionError } = useSocket(token)

  useEffect(() => {
    if (!socket || !cityId) return undefined

    socket.emit('join:city', cityId)
    socket.on('order:available', onAvailableOrder)

    return () => {
      socket.emit('leave:city', cityId)
      socket.off('order:available', onAvailableOrder)
    }
  }, [socket, cityId, onAvailableOrder])

  return { connected, connectionError }
}
