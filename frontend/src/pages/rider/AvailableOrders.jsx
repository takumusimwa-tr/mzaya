import { useCallback, useEffect, useState } from 'react'
import api from '../../api/api'
import useDispatchOffer from '../../hooks/useDispatchOffer'
import DispatchOfferCard from '../../components/dispatch/DispatchOfferCard'
import RealtimeStatus from '../../components/common/RealtimeStatus'
import EmptyState from '../../components/common/EmptyState'

export default function AvailableOrders({ token }) {
  const [initialOffer, setInitialOffer] = useState(null)

  useEffect(() => {
    api.get('/live-orders/rider/available').then(({ data }) => {
      const first = data.orders?.[0]
      if (!first) return
      setInitialOffer({
        id: first.offer_id,
        orderId: first.order.id,
        expiresAt: first.expires_at,
        pickupEtaMinutes: first.pickup_eta_minutes,
        distanceKm: first.distance_km,
      })
    })
  }, [])

  const offerState = useDispatchOffer({ token, initialOffer })
  const refreshAfterExpire = useCallback(() => {
    setInitialOffer(null)
  }, [])

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Mzaya</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">
            Available delivery
          </h1>
        </div>
        <RealtimeStatus
          connected={offerState.connected}
          error={offerState.connectionError}
        />
      </header>

      <div className="mt-6">
        {offerState.offer ? (
          <DispatchOfferCard
            offer={offerState.offer}
            submitting={offerState.submitting}
            onAccept={offerState.accept}
            onDecline={offerState.decline}
            onExpire={refreshAfterExpire}
          />
        ) : (
          <EmptyState
            title="You are ready"
            description="The next suitable delivery will appear here."
          />
        )}
      </div>
    </main>
  )
}
