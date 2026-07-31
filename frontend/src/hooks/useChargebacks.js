import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useChargebacks() {
  const [chargebacks, setChargebacks] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/chargebacks')
    setChargebacks(data.chargebacks || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const updateOutcome = async (chargebackId, outcome) => {
    await api.patch(`/chargebacks/${chargebackId}`, { outcome })
    await refresh()
  }

  return {
    chargebacks,
    loading,
    refresh,
    updateOutcome,
  }
}
