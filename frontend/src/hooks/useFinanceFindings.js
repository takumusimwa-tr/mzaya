import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'
import socket from '../realtime/socket'

export default function useFinanceFindings() {
  const [findings, setFindings] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/finance-audit-findings')
    setFindings(data.findings || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
    socket.on('finance_audit:finding_raised', refresh)

    return () => {
      socket.off('finance_audit:finding_raised', refresh)
    }
  }, [refresh])

  return { findings, loading, refresh }
}
