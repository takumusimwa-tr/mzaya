import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useExecutiveFinance({
  currency = 'USD',
  from,
  to,
}) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/executive-finance/dashboard', {
      params: { currency, from, to },
    })
    setSummary(data.summary)
  }, [currency, from, to])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  return { summary, loading, refresh }
}
