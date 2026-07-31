/**
 * ============================================================================
 * MZAYA
 * Component: DeliveryEtaCard
 * Path: frontend/src/components/orders/DeliveryEtaCard.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Displays the customer's current delivery estimate and a short explanation of
 * what is happening with the order.
 *
 * Responsibilities
 * ----------------
 * • Present ETA as the primary information.
 * • Show current status copy and optional delay notice.
 * • Support either a time range or a single ETA string.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not calculate ETA.
 * • Does not read live location data.
 * • Does not determine whether a delay has occurred.
 *
 * Used By
 * -------
 * • OrderTrackingPage.jsx
 *
 * Product Note
 * ------------
 * ETA values should come from the tracking service. Avoid displaying precision
 * the backend cannot reliably support.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { Clock3 } from 'lucide-react'

export default function DeliveryEtaCard({
  eta,
  label = 'Estimated arrival',
  statusMessage,
  delayMessage,
}) {
  return (
    <section
      className="rounded-[24px] border bg-white p-5"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-labelledby="delivery-eta-heading"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[16px]"
          style={{
            background: 'var(--mzaya-primary-soft)',
            color: 'var(--mzaya-primary)',
          }}
        >
          <Clock3 aria-hidden="true" size={21} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            id="delivery-eta-heading"
            className="text-[11px] font-medium uppercase tracking-[0.08em]"
            style={{ color: 'var(--mzaya-text-muted)' }}
          >
            {label}
          </p>

          <p
            className="mt-1 text-[27px] font-semibold tracking-[-0.035em]"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            {eta || 'Calculating'}
          </p>

          {statusMessage && (
            <p
              className="mt-2 text-[13px] leading-5"
              style={{ color: 'var(--mzaya-text-secondary)' }}
            >
              {statusMessage}
            </p>
          )}

          {delayMessage && (
            <p
              className="mt-2 text-[12px] leading-5"
              style={{ color: 'var(--mzaya-warning)' }}
              role="status"
            >
              {delayMessage}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
