import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'
import socket from '../realtime/socket'

export default function useFinanceRemediation() {
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/finance-remediation')
    setActions(data.actions || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
    socket.on('finance_audit:remediation_overdue', refresh)

    return () => {
      socket.off('finance_audit:remediation_overdue', refresh)
    }
  }, [refresh])

  const complete = async (remediationId, completionEvidence = {}) => {
    await api.patch(`/finance-remediation/${remediationId}/complete`, {
      completionEvidence,
    })
    await refresh()
  }

  const verify = async (remediationId, verificationNotes) => {
    await api.patch(`/finance-remediation/${remediationId}/verify`, {
      verificationNotes,
    })
    await refresh()
  }

  return { actions, loading, refresh, complete, verify }
}
