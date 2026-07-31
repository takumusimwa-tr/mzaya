import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useTaxCenter() {
  const [jurisdictions, setJurisdictions] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/tax/jurisdictions')
    setJurisdictions(data.jurisdictions || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const loadRates = async (jurisdictionId) => {
    const { data } = await api.get(
      `/tax/jurisdictions/${jurisdictionId}/rates`
    )
    return data.rates || []
  }

  return {
    jurisdictions,
    loading,
    refresh,
    loadRates,
  }
}
