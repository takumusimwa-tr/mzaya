import { useEffect, useState } from 'react'
import { getSocket } from '../realtime/socket'

export default function useSocket(token) {
  const [connected, setConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)

  const socket = token ? getSocket(token) : null

  useEffect(() => {
    if (!socket) return undefined
    if (!socket.connected) socket.connect()

    const onConnect = () => {
      setConnected(true)
      setConnectionError(null)
    }
    const onDisconnect = () => setConnected(false)
    const onConnectError = (error) => {
      setConnected(false)
      setConnectionError(error)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)

    if (socket.connected) setConnected(true)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)
    }
  }, [socket])

  return { socket, connected, connectionError }
}
