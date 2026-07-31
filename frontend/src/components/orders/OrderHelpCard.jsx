/**
 * ============================================================================
 * MZAYA
 * Component: OrderHelpCard
 * Path: frontend/src/components/orders/OrderHelpCard.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Gives customers a controlled route to request support for an active order.
 *
 * Responsibilities
 * ----------------
 * • Explain when support should be used.
 * • Expose one support action supplied by the parent page.
 * • Keep support visually secondary to order tracking.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not create support tickets.
 * • Does not cancel orders.
 * • Does not determine refund eligibility.
 *
 * Dependencies
 * ------------
 * • Button.jsx
 * • lucide-react
 *
 * Used By
 * -------
 * • OrderTrackingPage.jsx
 * • OrderDetailsPage.jsx
 *
 * Design Notes
 * ------------
 * Avoid urgent red styling unless there is an actual failure. Support should
 * feel available and trustworthy, not alarming.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { Headphones } from 'lucide-react'
import Button from '../ui/Button'

export default function OrderHelpCard({
  onGetHelp,
  title = 'Need help with this order?',
  message = 'Contact Mzaya support for delivery, payment, or item issues.',
}) {
  return (
    <section
      className="rounded-[22px] border bg-white p-5"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px]"
          style={{
            background: 'var(--mzaya-surface-muted)',
            color: 'var(--mzaya-text-secondary)',
          }}
        >
          <Headphones aria-hidden="true" size={19} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <h2
            className="text-[14px] font-semibold"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            {title}
          </h2>

          <p
            className="mt-1 text-[12px] leading-5"
            style={{ color: 'var(--mzaya-text-muted)' }}
          >
            {message}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={onGetHelp}
        className="mt-4 w-full"
      >
        Get order help
      </Button>
    </section>
  )
}
