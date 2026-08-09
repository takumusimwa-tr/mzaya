import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useVendorSettlementReconciliation() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/vendor-settlements/reconciliation')
    setResults(data.results || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const reconcile = async (settlementId) => {
    await api.post(`/vendor-settlements/${settlementId}/reconcile`)
    await refresh()
  }

  return {
    results,
    loading,
    refresh,
    reconcile,
  }
}
