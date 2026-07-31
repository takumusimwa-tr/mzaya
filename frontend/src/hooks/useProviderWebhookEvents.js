import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'
import socket from '../realtime/socket'

export default function useProviderWebhookEvents(filters = {}) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get(
      '/provider-webhook-admin/events',
      { params: filters }
    )
    setEvents(data.events || [])
  }, [filters])

  useEffect(() => {
    refresh().finally(() => setLoading(false))

    socket.on('provider_webhook:processed', refresh)
    socket.on('provider_webhook:failed', refresh)

    return () => {
      socket.off('provider_webhook:processed', refresh)
      socket.off('provider_webhook:failed', refresh)
    }
  }, [refresh])

  const retry = async (eventId) => {
    await api.post(
      `/provider-webhook-admin/events/${eventId}/retry`
    )
    await refresh()
  }

  return {
    events,
    loading,
    refresh,
    retry,
  }
}
