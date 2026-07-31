import { useEffect, useState } from 'react'
import api from '../api/api'
import socket from '../realtime/socket'

export default function useConversationUnreadCount() {
  const [count, setCount] = useState(0)

  const refresh = async () => {
    const { data } = await api.get('/chat-push/unread-count')
    setCount(Number(data.count) || 0)
  }

  useEffect(() => {
    refresh()

    const increment = () => setCount((current) => current + 1)
    const reset = () => refresh()

    socket.on('conversation:updated', increment)
    socket.on('conversation:message_read', reset)

    return () => {
      socket.off('conversation:updated', increment)
      socket.off('conversation:message_read', reset)
    }
  }, [])

  return {
    count,
    refresh,
  }
}
