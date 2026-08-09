import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useFinanceDelivery() {
  const [outbox, setOutbox] = useState([])
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/finance-delivery/dashboard')
    setOutbox(data.outbox || [])
    setAttempts(data.attempts || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  return {
    outbox,
    attempts,
    loading,
    refresh,
  }
}
