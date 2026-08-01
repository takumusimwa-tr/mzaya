import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useFinancialClose() {
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/financial-close')
    setCycles(data.cycles || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const startClose = async (periodId) => {
    const { data } = await api.post('/financial-close', { periodId })
    await refresh()
    return data.cycle
  }

  const completeTask = async (taskId, evidence = {}, notes = '') => {
    await api.patch(`/financial-close/tasks/${taskId}/complete`, {
      evidence,
      notes,
    })
    await refresh()
  }

  const generateTrialBalance = async (
    closeCycleId,
    currency,
    snapshotType = 'pre_close'
  ) => {
    const { data } = await api.post(
      `/financial-close/${closeCycleId}/trial-balance`,
      { currency, snapshotType }
    )
    return data.snapshot
  }

  const completeClose = async (closeCycleId) => {
    await api.patch(`/financial-close/${closeCycleId}/complete`)
    await refresh()
  }

  return {
    cycles,
    loading,
    refresh,
    startClose,
    completeTask,
    generateTrialBalance,
    completeClose,
  }
}
