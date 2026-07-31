import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

/**
 * Admin-only ledger detail hook used by finance and support operations.
 */
export default function useLedgerTransaction(transactionId) {
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(Boolean(transactionId))
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!transactionId) return

    setError(null)
    const { data } = await api.get(
      `/ledger/transactions/${transactionId}`
    )
    setTransaction(data.transaction)
  }, [transactionId])

  useEffect(() => {
    refresh()
      .catch(setError)
      .finally(() => setLoading(false))
  }, [refresh])

  const reverse = useCallback(async (reason) => {
    const { data } = await api.post(
      `/ledger/transactions/${transactionId}/reverse`,
      { reason }
    )

    await refresh()
    return data.transaction
  }, [transactionId, refresh])

  return {
    transaction,
    loading,
    error,
    refresh,
    reverse,
  }
}
