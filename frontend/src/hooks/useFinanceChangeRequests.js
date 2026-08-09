import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useFinanceChangeRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/finance-change-requests')
    setRequests(data.requests || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const decide = async (id, decision, notes = '') => {
    await api.post(`/finance-change-requests/${id}/decision`, { decision, notes })
    await refresh()
  }

  return { requests, loading, refresh, decide }
}
