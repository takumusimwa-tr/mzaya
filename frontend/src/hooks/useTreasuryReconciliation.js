import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useTreasuryReconciliation() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/treasury-reconciliation/queue')
    setTransactions(data.transactions || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const reconcile = async (bankTransactionId, ledgerTransactionId, notes = '') => {
    await api.post(
      `/treasury-reconciliation/${bankTransactionId}/match`,
      { ledgerTransactionId, notes }
    )
    await refresh()
  }

  return { transactions, loading, refresh, reconcile }
}
