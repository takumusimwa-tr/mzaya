import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useTaxReconciliation() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/tax-finance/reconciliation')
    setResults(data.results || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const reconcile = async (taxTransactionId) => {
    await api.post(
      `/tax-finance/transactions/${taxTransactionId}/reconcile`
    )
    await refresh()
  }

  return {
    results,
    loading,
    refresh,
    reconcile,
  }
}
