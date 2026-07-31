import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'
import socket from '../realtime/socket'

export default function useConversationMessages(conversationId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [nextCursor, setNextCursor] = useState(null)

  const load = useCallback(async ({ cursor } = {}) => {
    if (!conversationId) return

    const { data } = await api.get(
      `/conversations/${conversationId}/messages`,
      { params: cursor ? { cursor } : {} }
    )

    const incoming = data.messages || []
    setMessages((current) =>
      cursor ? [...current, ...incoming] : incoming
    )
    setNextCursor(data.nextCursor || null)
  }, [conversationId])

  const send = useCallback(async ({
    body,
    type = 'text',
    metadata = {},
    replyToMessageId = null,
  }) => {
    const clientMessageId = crypto.randomUUID()

    const { data } = await api.post(
      `/conversations/${conversationId}/messages`,
      {
        clientMessageId,
        type,
        body,
        metadata,
        replyToMessageId,
      }
    )

    setMessages((current) => [
      data.message,
      ...current.filter((item) => item.id !== data.message.id),
    ])

    return data.message
  }, [conversationId])

  const markRead = useCallback(async (messageId) => {
    await api.patch(`/conversations/${conversationId}/read`, {
      messageId,
    })
  }, [conversationId])

  useEffect(() => {
    if (!conversationId) return undefined

    load().finally(() => setLoading(false))

    socket.emit('conversation:join', { conversationId })

    const handleMessage = ({ conversationId: eventId }) => {
      if (eventId === conversationId) load()
    }

    socket.on('conversation:message_created', handleMessage)

    return () => {
      socket.emit('conversation:leave', { conversationId })
      socket.off('conversation:message_created', handleMessage)
    }
  }, [conversationId, load])

  return {
    messages,
    loading,
    hasMore: Boolean(nextCursor),
    send,
    markRead,
    refresh: () => load(),
    loadMore: () => nextCursor && load({ cursor: nextCursor }),
  }
}
