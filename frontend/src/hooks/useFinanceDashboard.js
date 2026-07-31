import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'
import socket from '../realtime/socket'

export default function useFinanceDashboard(filters) {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setError(null)

    try {
      const { data } = await api.get('/finance-dashboard', {
        params: filters,
      })
      setDashboard(data.dashboard)
    } catch (requestError) {
      setError(requestError)
      throw requestError
    }
  }, [filters])

  useEffect(() => {
    refresh().finally(() => setLoading(false))

    socket.on('finance_dashboard:refresh', refresh)

    return () => {
      socket.off('finance_dashboard:refresh', refresh)
    }
  }, [refresh])

  return {
    dashboard,
    loading,
    error,
    refresh,
  }
}
