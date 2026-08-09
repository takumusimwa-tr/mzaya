import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useMzayaPayouts() {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/mzaya-payouts')
    setPayouts(data.payouts || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const approve = async (payoutId) => {
    await api.post(`/mzaya-payouts/${payoutId}/approve`)
    await refresh()
  }

  const pay = async (payoutId, payload) => {
    await api.post(`/mzaya-payouts/${payoutId}/pay`, payload)
    await refresh()
  }

  return {
    payouts,
    loading,
    refresh,
    approve,
    pay,
  }
}
