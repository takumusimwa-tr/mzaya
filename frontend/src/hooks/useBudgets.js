import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useBudgets() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/budgets')
    setBudgets(data.budgets || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const approveVersion = async (budgetVersionId) => {
    await api.patch(`/budgets/versions/${budgetVersionId}/approve`)
    await refresh()
  }

  return {
    budgets,
    loading,
    refresh,
    approveVersion,
  }
}
