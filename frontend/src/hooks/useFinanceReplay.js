import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useFinanceReplay() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/finance-replay')
    setItems(data.items || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const queue = async (businessEventId, reason) => {
    await api.post(`/finance-replay/${businessEventId}`, { reason })
    await refresh()
  }

  return {
    items,
    loading,
    refresh,
    queue,
  }
}
