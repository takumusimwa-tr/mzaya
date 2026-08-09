import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useFinancePosting() {
  const [data, setData] = useState({
    rules: [],
    templates: [],
    accountingEvents: [],
    batches: [],
    failures: [],
  })
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const response = await api.get('/finance-posting/dashboard')
    setData(response.data)
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  return {
    ...data,
    loading,
    refresh,
  }
}
