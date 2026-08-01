import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useTreasuryExecution() {
  const [transfers, setTransfers] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [transferResponse, dealResponse] = await Promise.all([
      api.get('/treasury-transfers'),
      api.get('/fx-deals'),
    ])

    setTransfers(transferResponse.data.transfers || [])
    setDeals(dealResponse.data.deals || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const approveTransfer = async (transferId) => {
    await api.patch(`/treasury-execution/${transferId}/approve`)
    await refresh()
  }

  const executeTransfer = async (transferId) => {
    await api.post(`/treasury-execution/${transferId}/execute`)
    await refresh()
  }

  return {
    transfers,
    deals,
    loading,
    refresh,
    approveTransfer,
    executeTransfer,
  }
}
