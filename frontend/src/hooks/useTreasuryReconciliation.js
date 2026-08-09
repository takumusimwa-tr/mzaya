import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useTreasuryReconciliation() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/treasury-finance/reconciliation')
    setResults(data.results || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const reconcile = async (transferId) => {
    await api.post(`/treasury-finance/transfers/${transferId}/reconcile`)
    await refresh()
  }

  return { results, loading, refresh, reconcile }
}
