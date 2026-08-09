import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useFinanceDeadLetters() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/finance-dead-letters')
    setItems(data.items || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const replay = async (deadLetterId) => {
    await api.post(`/finance-dead-letters/${deadLetterId}/replay`)
    await refresh()
  }

  return {
    items,
    loading,
    refresh,
    replay,
  }
}
