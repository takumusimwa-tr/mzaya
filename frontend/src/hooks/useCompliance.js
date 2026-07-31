import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useCompliance() {
  const [periods, setPeriods] = useState([])
  const [audit, setAudit] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [periodResponse, auditResponse] = await Promise.all([
      api.get('/compliance/periods'),
      api.get('/compliance/audit'),
    ])
    setPeriods(periodResponse.data.periods || [])
    setAudit(auditResponse.data.audit || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const closePeriod = async (periodId, notes = '') => {
    await api.patch(`/compliance/periods/${periodId}/close`, { notes })
    await refresh()
  }

  const reopenPeriod = async (periodId, notes = '') => {
    await api.patch(`/compliance/periods/${periodId}/reopen`, { notes })
    await refresh()
  }

  return {
    periods,
    audit,
    loading,
    closePeriod,
    reopenPeriod,
    refresh,
  }
}
