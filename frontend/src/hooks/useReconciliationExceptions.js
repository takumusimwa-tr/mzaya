import { useCallback, useEffect, useState } from 'react'
import api from '../api/api'

/**
 * Loads finance exceptions that require human review.
 */
export default function useReconciliationExceptions() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const { data } = await api.get('/reconciliation/exceptions')
    setRecords(data.records || [])
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  return {
    records,
    loading,
    refresh,
  }
}
