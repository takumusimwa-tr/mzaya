import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'
import socket from '../realtime/socket'

export default function useSupportQueue(filters = {}) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [nextCursor, setNextCursor] = useState(null)

  const load = useCallback(async ({ cursor } = {}) => {
    const { data } = await api.get('/support/tickets', {
      params: {
        ...filters,
        ...(cursor ? { cursor } : {}),
      },
    })

    setTickets((current) =>
      cursor ? [...current, ...(data.tickets || [])] : data.tickets || []
    )
    setNextCursor(data.nextCursor || null)
  }, [filters])

  useEffect(() => {
    load().finally(() => setLoading(false))

    const refresh = () => load()
    socket.on('support:ticket_created', refresh)
    socket.on('support:ticket_assigned', refresh)
    socket.on('support:ticket_escalated', refresh)
    socket.on('support:ticket_status_changed', refresh)

    return () => {
      socket.off('support:ticket_created', refresh)
      socket.off('support:ticket_assigned', refresh)
      socket.off('support:ticket_escalated', refresh)
      socket.off('support:ticket_status_changed', refresh)
    }
  }, [load])

  return {
    tickets,
    loading,
    hasMore: Boolean(nextCursor),
    loadMore: () => nextCursor && load({ cursor: nextCursor }),
    refresh: () => load(),
  }
}
