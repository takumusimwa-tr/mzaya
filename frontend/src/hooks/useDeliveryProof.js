import { useCallback, useState } from 'react'
import { deliveryProofAPI } from '../api/deliveryProof'

export default function useDeliveryProof(orderId) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [proof, setProof] = useState(null)

  const submit = useCallback(async (payload) => {
    if (!orderId) return null
    setSubmitting(true)
    setError(null)

    try {
      const { data } = await deliveryProofAPI.submit(orderId, payload)
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
