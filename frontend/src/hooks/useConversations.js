import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'
import socket from '../realtime/socket'

export default function useConversations() {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [nextCursor, setNextCursor] = useState(null)

  const load = useCallback(async ({ cursor } = {}) => {
    const { data } = await api.get('/conversations', {
      params: cursor ? { cursor } : {},
    })

    setConversations((current) =>
      cursor
        ? [...current, ...(data.conversations || [])]
        : data.conversations || []
    )
    setNextCursor(data.nextCursor || null)
  }, [])

  useEffect(() => {
    load().finally(() => setLoading(false))

    const refresh = () => load()
    socket.on('conversation:created', refresh)
    socket.on('conversation:updated', refresh)

    return () => {
      socket.off('conversation:created', refresh)
      socket.off('conversation:updated', refresh)
    }
  }, [load])

  return {
    conversations,
    loading,
    hasMore: Boolean(nextCursor),
    loadMore: () => nextCursor && load({ cursor: nextCursor }),
    refresh: () => load(),
  }
}
