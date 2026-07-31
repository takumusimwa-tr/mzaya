import { useEffect, useState } from 'react'
import api from '../api/api'
import useSocket from './useSocket'

export default function useUnreadCount(token) {
  const { socket } = useSocket(token)
  const [count, setCount] = useState(0)

  useEffect(() => {
    api.get('/notifications/unread-count')
      .then(({ data }) => setCount(Number(data.count) || 0))
  }, [])

  useEffect(() => {
    if (!socket) return undefined

    const onNew = () => setCount((current) => current + 1)
    const onRead = () => setCount((current) => Math.max(0, current - 1))
    const onReadAll = () => setCount(0)

    socket.on('notification:new', onNew)
    socket.on('notification:read', onRead)
    socket.on('notification:read_all', onReadAll)

    return () => {
      socket.off('notification:new', onNew)
      socket.off('notification:read', onRead)
      socket.off('notification:read_all', onReadAll)
    }
  }, [socket])

  return count
}
