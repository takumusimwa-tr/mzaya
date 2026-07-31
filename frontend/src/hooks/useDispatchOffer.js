import { useCallback, useEffect, useMemo, useState } from 'react'
import useSocket from './useSocket'
import api from '../api/api'

export default function useDispatchOffer({ token, initialOffer = null }) {
  const { socket, connected, connectionError } = useSocket(token)
  const [offer, setOffer] = useState(initialOffer)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!socket) return undefined

    const assignedHandler = (payload) => setOffer(payload)
    socket.on('order:assigned', assignedHandler)
    return () => socket.off('order:assigned', assignedHandler)
  }, [socket])

  const respond = useCallback(async (accept, declineReason) => {
    if (!offer?.id && !offer?.offerId) return null
    setSubmitting(true)
    setError(null)

    try {
      const offerId = offer.id || offer.offerId
      const response = await api.post(`/dispatch/offers/${offerId}/respond`, {
        accept,
        decline_reason: accept ? undefined : declineReason,
      })
      if (!accept) setOffer(null)
      return response.data
    } catch (requestError) {
      setError(requestError)
      throw requestError
    } finally {
      setSubmitting(false)
    }
  }, [offer])

  return useMemo(() => ({
    offer,
    connected,
    connectionError,
    submitting,
    error,
    accept: () => respond(true),
    decline: (reason) => respond(false, reason),
  }), [offer, connected, connectionError, submitting, error, respond])
}
