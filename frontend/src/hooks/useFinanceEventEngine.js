import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useFinanceEventEngine() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/finance-events')
    setEvents(data.events || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const processEvent = async (businessEventId) => {
    await api.post(`/finance-events/${businessEventId}/process`)
    await refresh()
  }

  return {
    events,
    loading,
    refresh,
    processEvent,
  }
}
