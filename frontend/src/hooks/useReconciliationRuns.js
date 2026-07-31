import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'
import socket from '../realtime/socket'

export default function useReconciliationRuns() {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get(
      '/provider-webhook-admin/reconciliation-runs'
    )
    setRuns(data.runs || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))

    socket.on('reconciliation:completed', refresh)

    return () => {
      socket.off('reconciliation:completed', refresh)
    }
  }, [refresh])

  return {
    runs,
    loading,
    refresh,
  }
}
