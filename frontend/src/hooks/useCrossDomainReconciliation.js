import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useCrossDomainReconciliation() {
  const [data, setData] = useState({
    runs: [],
    exceptions: [],
    snapshots: [],
  })
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const response = await api.get(
      '/finance-cross-domain-reconciliation/dashboard'
    )
    setData(response.data)
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const run = async () => {
    await api.post('/finance-cross-domain-reconciliation/runs')
    await refresh()
  }

  return {
    ...data,
    loading,
    refresh,
    run,
  }
}
