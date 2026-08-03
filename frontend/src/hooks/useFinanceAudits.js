import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'
import socket from '../realtime/socket'

export default function useFinanceAudits() {
  const [data, setData] = useState({
    plans: [],
    engagements: [],
    assessments: [],
    evidence: [],
  })
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const response = await api.get('/finance-audit/dashboard')
    setData(response.data)
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
    socket.on('finance_audit:assessment_completed', refresh)

    return () => {
      socket.off('finance_audit:assessment_completed', refresh)
    }
  }, [refresh])

  return { ...data, loading, refresh }
}
