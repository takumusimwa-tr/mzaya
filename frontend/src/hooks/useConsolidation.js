import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useConsolidation() {
  const [groups, setGroups] = useState([])
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [groupResponse, runResponse] = await Promise.all([
      api.get('/consolidation/groups'),
      api.get('/consolidation/runs'),
    ])

    setGroups(groupResponse.data.groups || [])
    setRuns(runResponse.data.runs || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const startRun = async (consolidationGroupId, periodCode) => {
    await api.post('/consolidation/runs', {
      consolidationGroupId,
      periodCode,
    })
    await refresh()
  }

  return {
    groups,
    runs,
    loading,
    refresh,
    startRun,
  }
}
