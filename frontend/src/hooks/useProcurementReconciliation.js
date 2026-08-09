import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useProcurementReconciliation() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/procurement-finance/reconciliation')
    setResults(data.results || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const reconcile = async (procurementId) => {
    await api.post(`/procurement-finance/${procurementId}/reconcile`)
    await refresh()
  }

  return {
    results,
    loading,
    refresh,
    reconcile,
  }
}
