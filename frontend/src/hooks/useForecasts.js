import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useForecasts() {
  const [forecasts, setForecasts] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/forecasts')
    setForecasts(data.forecasts || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  return {
    forecasts,
    loading,
    refresh,
  }
}
