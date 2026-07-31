/**
 * ============================================================================
 * MZAYA
 * Component: CourierCard
 * Path: frontend/src/components/orders/CourierCard.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Shows the assigned courier and exposes safe contact actions while an order is
 * in progress.
 *
 * Responsibilities
 * ----------------
 * • Display courier name, photo, vehicle and rating when available.
 * • Provide call and message actions supplied by the parent.
 * • Handle the unassigned state without showing broken placeholders.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not reveal private courier contact details.
 * • Does not initiate calls or messages directly.
 * • Does not determine courier assignment.
 *
 * Data Contract
 * -------------
 * courier?: {
 *   name?: string,
 *   photo_url?: string,
 *   vehicle?: string,
 *   rating?: number
 * }
 *
 * Privacy Note
 * ------------
 * Contact actions should use platform-mediated calling or messaging whenever
 * available. Do not expose a courier's personal number in the UI.
 *
 * Dependencies
 * ------------
 * • Button.jsx
 * • imageUrl()
 * • lucide-react
 *
 * Used By
 * -------
 * • OrderTrackingPage.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { MessageCircle, Phone, UserRound } from 'lucide-react'
import Button from '../ui/Button'
import imageUrl from '../../utils/imageUrl'

export default function CourierCard({
  courier,
  onCall,
  onMessage,
  disabled = false,
}) {
  if (!courier) {
    return (
      <section
        className="rounded-[22px] border bg-white p-5"
        style={{
          borderColor: 'var(--mzaya-border)',
          boxShadow: 'var(--mzaya-shadow-sm)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              background: 'var(--mzaya-surface-muted)',
              color: 'var(--mzaya-text-muted)',
            }}
          >
            <UserRound aria-hidden="true" size={21} strokeWidth={1.7} />
          </div>

          <div>
            <p
              className="text-[14px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              Finding your courier
            </p>
            <p
              className="mt-1 text-[12px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Courier details will appear once someone accepts the order.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="rounded-[22px] border bg-white p-5"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-labelledby="courier-card-heading"
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
          style={{ background: 'var(--mzaya-surface-muted)' }}
        >
          {courier.photo_url ? (
            <img
              src={imageUrl(courier.photo_url, 180)}
              alt={courier.name || 'Assigned courier'}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound
              aria-hidden="true"
              size={22}
              strokeWidth={1.7}
              style={{ color: 'var(--mzaya-text-muted)' }}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            id="courier-card-heading"
            className="truncate text-[15px] font-semibold"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            {courier.name || 'Assigned courier'}
          </p>

          <p
            className="mt-1 truncate text-[12px]"
            style={{ color: 'var(--mzaya-text-muted)' }}
          >
            {[courier.vehicle, courier.rating ? `${courier.rating.toFixed(1)} rating` : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </div>

      {(onCall || onMessage) && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {onCall && (
            <Button
              variant="outline"
              leadingIcon={Phone}
              onClick={onCall}
              disabled={disabled}
            >
              Call
            </Button>
          )}

          {onMessage && (
            <Button
              variant="outline"
              leadingIcon={MessageCircle}
              onClick={onMessage}
              disabled={disabled}
            >
              Message
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
