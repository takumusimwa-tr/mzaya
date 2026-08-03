import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useIntercompany() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/intercompany')
    setTransactions(data.transactions || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  return {
    transactions,
    loading,
    refresh,
  }
}
