import AssignmentTimer from './AssignmentTimer'
import ETABadge from './ETABadge'

export default function DispatchOfferCard({
  offer,
  submitting,
  onAccept,
  onDecline,
  onExpire,
}) {
  if (!offer) return null

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            New delivery
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">
            Order #{String(offer.orderId || offer.order_id).slice(0, 8)}
          </h2>
        </div>
        <AssignmentTimer expiresAt={offer.expiresAt || offer.expires_at} onExpire={onExpire} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ETABadge minutes={offer.pickupEtaMinutes || offer.pickup_eta_minutes} prefix="Pickup" />
        {offer.distanceKm != null || offer.distance_km != null ? (
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {Number(offer.distanceKm ?? offer.distance_km).toFixed(1)} km away
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={submitting}
          onClick={() => onDecline?.('Unavailable')}
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
        >
          Decline
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={onAccept}
          className="rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          Accept delivery
        </button>
      </div>
    </article>
  )
}
