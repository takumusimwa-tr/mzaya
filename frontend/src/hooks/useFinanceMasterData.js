import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useFinanceMasterData() {
  const [data, setData] = useState({ domains: [], records: [], periodLocks: [] })
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const response = await api.get('/finance-master-data/dashboard')
    setData(response.data)
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  return { ...data, loading, refresh }
}
