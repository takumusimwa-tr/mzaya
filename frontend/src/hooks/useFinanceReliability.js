import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

export default function useFinanceReliability() {
  const [snapshots, setSnapshots] = useState([])
  const [consumers, setConsumers] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/finance-reliability/dashboard')
    setSnapshots(data.snapshots || [])
    setConsumers(data.consumers || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  return {
    snapshots,
    consumers,
    loading,
    refresh,
  }
}
