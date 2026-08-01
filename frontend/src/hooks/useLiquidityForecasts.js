import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useLiquidityForecasts() {
  const [scenarios, setScenarios] = useState([])
  const [forecasts, setForecasts] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [scenarioResponse, forecastResponse] = await Promise.all([
      api.get('/liquidity-forecasts/scenarios'),
      api.get('/liquidity-forecasts'),
    ])

    setScenarios(scenarioResponse.data.scenarios || [])
    setForecasts(forecastResponse.data.forecasts || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  return {
    scenarios,
    forecasts,
    loading,
    refresh,
  }
}
