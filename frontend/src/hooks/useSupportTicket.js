import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'
import socket from '../realtime/socket'

export default function useSupportTicket(ticketId) {
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!ticketId) return
    const { data } = await api.get(`/support/tickets/${ticketId}`)
    setTicket(data.ticket)
  }, [ticketId])

  useEffect(() => {
    if (!ticketId) return undefined

    refresh().finally(() => setLoading(false))
    socket.emit('support:ticket_join', { ticketId })

    const handleUpdate = ({ ticketId: eventTicketId }) => {
      if (eventTicketId === ticketId) refresh()
    }

    socket.on('support:ticket_assigned', handleUpdate)
    socket.on('support:ticket_escalated', handleUpdate)
    socket.on('support:ticket_status_changed', handleUpdate)
    socket.on('support:note_created', handleUpdate)

    return () => {
      socket.emit('support:ticket_leave', { ticketId })
      socket.off('support:ticket_assigned', handleUpdate)
      socket.off('support:ticket_escalated', handleUpdate)
      socket.off('support:ticket_status_changed', handleUpdate)
      socket.off('support:note_created', handleUpdate)
    }
  }, [ticketId, refresh])

  const assign = async (agentId) => {
    await api.patch(`/support/tickets/${ticketId}/assign`, { agentId })
    await refresh()
  }

  const update = async (changes) => {
    await api.patch(`/support/tickets/${ticketId}`, changes)
    await refresh()
  }

  const addNote = async (body) => {
    await api.post(`/support/tickets/${ticketId}/notes`, { body })
    await refresh()
  }

  return {
    ticket,
    loading,
    refresh,
    assign,
    update,
    addNote,
  }
}
