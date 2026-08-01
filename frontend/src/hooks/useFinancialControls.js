import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useFinancialControls() {
  const [data, setData] = useState({ policies: [], approvals: [], exceptions: [] })
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [policies, approvals, exceptions] = await Promise.all([
      api.get('/financial-controls/policies'),
      api.get('/financial-controls/approvals', { params: { status: 'pending' } }),
      api.get('/financial-controls/exceptions', { params: { status: 'open' } }),
    ])
    setData({
      policies: policies.data.policies || [],
      approvals: approvals.data.approvals || [],
      exceptions: exceptions.data.exceptions || [],
    })
  }, [])

  useEffect(() => { refresh().finally(() => setLoading(false)) }, [refresh])

  const decide = async (id, decision) => {
    await api.post(`/financial-controls/approvals/${id}/decision`, { decision })
    await refresh()
  }

  const resolveException = async (id, resolutionNotes) => {
    await api.patch(`/financial-controls/exceptions/${id}/resolve`, { resolutionNotes })
    await refresh()
  }

  return { ...data, loading, refresh, decide, resolveException }
}
