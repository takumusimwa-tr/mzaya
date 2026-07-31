import { useCallback, useState } from 'react'
import api from '../api/api'

export default function useRefunds() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const requestRefund = useCallback(async (payload) => {
    setSubmitting(true)
    setError(null)

    try {
      const { data } = await api.post('/refunds', payload, {
        headers: {
          'Idempotency-Key': crypto.randomUUID(),
        },
      })
      return data.refund
    } catch (requestError) {
      setError(requestError)
      throw requestError
    } finally {
      setSubmitting(false)
    }
  }, [])

  return {
    requestRefund,
    submitting,
    error,
  }
}
