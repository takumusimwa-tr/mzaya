import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useTreasuryTransfers() {
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/treasury-transfers')
    setTransfers(data.transfers || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const createTransfer = async (payload) => {
    const { data } = await api.post('/treasury-transfers', payload)
    await refresh()
    return data.transfer
  }

  return {
    transfers,
    loading,
    refresh,
    createTransfer,
  }
}
