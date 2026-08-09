import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function usePaymentFinanceReconciliation() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/payment-finance/reconciliation')
    setResults(data.results || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const reconcile = async (paymentId) => {
    await api.post(`/payment-finance/${paymentId}/reconcile`)
    await refresh()
  }

  return {
    results,
    loading,
    refresh,
    reconcile,
  }
}
