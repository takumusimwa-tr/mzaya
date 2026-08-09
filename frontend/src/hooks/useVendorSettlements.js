import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useVendorSettlements() {
  const [settlements, setSettlements] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/vendor-settlements')
    setSettlements(data.settlements || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const approve = async (settlementId) => {
    await api.post(`/vendor-settlements/${settlementId}/approve`)
    await refresh()
  }

  const pay = async (settlementId, payload) => {
    await api.post(`/vendor-settlements/${settlementId}/pay`, payload)
    await refresh()
  }

  return {
    settlements,
    loading,
    refresh,
    approve,
    pay,
  }
}
