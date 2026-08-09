import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useFinanceCutover() {
  const [data, setData] = useState({
    controls: [],
    decisions: [],
    checks: [],
    legacyAttempts: [],
  })
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const response = await api.get('/finance-cutover/dashboard')
    setData(response.data)
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const requestCutover = async (controlId, reason) => {
    await api.post(
      `/finance-cutover/controls/${controlId}/request`,
      { reason }
    )
    await refresh()
  }

  const approveDecision = async (decisionId) => {
    await api.post(
      `/finance-cutover/decisions/${decisionId}/approve`
    )
    await refresh()
  }

  const rollback = async (controlId, reason) => {
    await api.post(
      `/finance-cutover/controls/${controlId}/rollback`,
      { reason }
    )
    await refresh()
  }

  return {
    ...data,
    loading,
    refresh,
    requestCutover,
    approveDecision,
    rollback,
  }
}
