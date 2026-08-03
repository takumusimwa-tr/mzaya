import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useGroupReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/group-reports')
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
