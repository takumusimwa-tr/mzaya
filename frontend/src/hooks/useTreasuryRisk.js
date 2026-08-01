import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useTreasuryRisk() {
  const [rates, setRates] = useState([])
  const [exposures, setExposures] = useState([])
  const [alerts, setAlerts] = useState([])
  const [limits, setLimits] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [rateResponse, exposureResponse, riskResponse] =
      await Promise.all([
        api.get('/fx/rates'),
        api.get('/fx/exposures'),
        api.get('/treasury-risk/dashboard'),
      ])

    setRates(rateResponse.data.rates || [])
    setExposures(exposureResponse.data.exposures || [])
    setAlerts(riskResponse.data.alerts || [])
    setLimits(riskResponse.data.limits || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  return {
    rates,
    exposures,
    alerts,
    limits,
    loading,
    refresh,
  }
}
