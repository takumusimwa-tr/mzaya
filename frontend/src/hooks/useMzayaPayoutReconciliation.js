import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useMzayaPayoutReconciliation() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/mzaya-payouts/reconciliation')
    setResults(data.results || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const reconcile = async (payoutId) => {
    await api.post(`/mzaya-payouts/${payoutId}/reconcile`)
    await refresh()
  }

  return {
    results,
    loading,
    refresh,
    reconcile,
  }
}
