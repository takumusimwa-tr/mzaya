import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useTreasuryFinance() {
  const [transfers, setTransfers] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [transferResponse, movementResponse] = await Promise.all([
      api.get('/treasury-finance/transfers'),
      api.get('/treasury-finance/bank-movements'),
    ])

    setTransfers(transferResponse.data.transfers || [])
    setMovements(movementResponse.data.movements || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const approve = async (transferId) => {
    await api.post(`/treasury-finance/transfers/${transferId}/approve`)
    await refresh()
  }

  return {
    transfers,
    movements,
    loading,
    refresh,
    approve,
  }
}
