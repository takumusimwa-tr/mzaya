import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useFinanceDataQuality() {
  const [rules, setRules] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/finance-data-quality/dashboard')
    setRules(data.rules || [])
    setResults(data.results || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const runAssessment = async (domainId = null) => {
    await api.post('/finance-data-quality/runs', { domainId })
    await refresh()
  }

  return { rules, results, loading, refresh, runAssessment }
}
