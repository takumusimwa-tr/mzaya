import { useCallback, useState } from 'react'
import api from '../api/api'

export default function useSettlementBatches() {
  const [batch, setBatch] = useState(null)
  const [loading, setLoading] = useState(false)

  const createBatch = useCallback(async (payload) => {
    setLoading(true)
    try {
      const { data } = await api.post('/settlements/batches', payload)
      setBatch(data.batch)
      return data.batch
    } finally {
      setLoading(false)
    }
  }, [])

  const loadBatch = useCallback(async (batchId) => {
    const { data } = await api.get(`/settlements/batches/${batchId}`)
    setBatch(data.batch)
    return data.batch
  }, [])

  const approveBatch = useCallback(async (batchId) => {
    const { data } = await api.patch(
      `/settlements/batches/${batchId}/approve`
    )
    setBatch(data.batch)
    return data.batch
  }, [])

  const submitBatch = useCallback(async (batchId) => {
    const { data } = await api.post(
      `/settlements/batches/${batchId}/submit`
    )
    setBatch(data.batch)
    return data.batch
  }, [])

  return {
    batch,
    loading,
    createBatch,
    loadBatch,
    approveBatch,
    submitBatch,
  }
}
