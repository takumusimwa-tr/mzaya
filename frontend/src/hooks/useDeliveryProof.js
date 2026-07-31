import { useCallback, useState } from 'react'
import api from '../api/api'

export default function useDeliveryProof(orderId) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [proof, setProof] = useState(null)

  const submit = useCallback(async (payload) => {
    if (!orderId) return null
    setSubmitting(true)
    setError(null)

    try {
      const { data } = await api.post(
        `/delivery-proof/orders/${orderId}`,
        payload
      )
      setProof(data.proof)
      return data
    } catch (requestError) {
      setError(requestError)
      throw requestError
    } finally {
      setSubmitting(false)
    }
  }, [orderId])

  return { submit, submitting, error, proof }
}
