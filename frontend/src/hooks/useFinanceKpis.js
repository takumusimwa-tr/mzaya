import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useFinanceKpis() {
  const [definitions, setDefinitions] = useState([])
  const [snapshots, setSnapshots] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [definitionResponse, snapshotResponse] = await Promise.all([
      api.get('/finance-kpis/definitions'),
      api.get('/finance-kpis/snapshots'),
    ])

    setDefinitions(definitionResponse.data.definitions || [])
    setSnapshots(snapshotResponse.data.snapshots || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  return {
    definitions,
    snapshots,
    loading,
    refresh,
  }
}
