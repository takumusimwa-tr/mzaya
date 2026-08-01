import { useCallback, useState } from 'react'
import api from '../api/api'

export default function useReconciliationCandidates() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (bankTransactionId) => {
    setLoading(true)
    try {
      const { data } = await api.get(
        `/treasury-reconciliation-review/bank-transactions/${bankTransactionId}/candidates`
      )
      setCandidates(data.candidates || [])
      return data.candidates || []
    } finally {
      setLoading(false)
    }
  }, [])

  const accept = async (candidateId, notes = '') => {
    await api.post(
      `/treasury-reconciliation-review/candidates/${candidateId}/accept`,
      { notes }
    )
  }

  const reject = async (candidateId, notes = '') => {
    await api.post(
      `/treasury-reconciliation-review/candidates/${candidateId}/reject`,
      { notes }
    )
  }

  return {
    candidates,
    loading,
    load,
    accept,
    reject,
  }
}
