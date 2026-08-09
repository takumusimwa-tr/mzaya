import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useOrderFinanceReconciliation(orderType = '') {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/order-finance/reconciliation', {
      params: orderType ? { orderType } : {},
    })
    setResults(data.results || [])
  }, [orderType])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const reconcile = async (type, orderId) => {
    await api.post(`/order-finance/${type}/${orderId}/reconcile`)
    await refresh()
  }

  return {
    results,
    loading,
    refresh,
    reconcile,
  }
}
