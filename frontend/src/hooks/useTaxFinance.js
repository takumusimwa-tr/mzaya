import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useTaxFinance() {
  const [transactions, setTransactions] = useState([])
  const [liabilities, setLiabilities] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [tx, liabilitiesResponse] = await Promise.all([
      api.get('/tax-finance/transactions'),
      api.get('/tax-finance/liabilities'),
    ])

    setTransactions(tx.data.transactions || [])
    setLiabilities(liabilitiesResponse.data.liabilities || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  return {
    transactions,
    liabilities,
    loading,
    refresh,
  }
}
