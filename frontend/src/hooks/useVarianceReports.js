import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useVarianceReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/variance-reports')
    setReports(data.reports || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  return {
    reports,
    loading,
    refresh,
  }
}
