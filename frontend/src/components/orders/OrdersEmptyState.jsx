/**
 * ============================================================================
 * MZAYA
 * Component: OrdersEmptyState
 * Path: frontend/src/components/orders/OrdersEmptyState.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Provides a premium empty state when a customer has no matching orders.
 *
 * Responsibilities
 * ----------------
 * • Explain the empty state in plain language.
 * • Offer an optional browse action.
 * • Support different copy for active and historical order tabs.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not navigate directly.
 * • Does not determine why order data is unavailable.
 * • Does not replace network error handling.
 *
 * Dependencies
 * ------------
 * • Button.jsx
 * • lucide-react
 *
 * Used By
 * -------
 * • OrdersPage.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { ReceiptText } from 'lucide-react'
import Button from '../ui/Button'

export default function OrdersEmptyState({
  title = 'No orders yet',
  message = 'Your orders will appear here once you place one.',
  actionLabel = 'Browse Mzaya',
  onAction,
}) {
  return (
    <section className="px-6 py-14 text-center">
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px]"
        style={{
          background: 'var(--mzaya-primary-soft)',
          color: 'var(--mzaya-primary)',
        }}
      >
        <ReceiptText aria-hidden="true" size={26} strokeWidth={1.6} />
      </div>

      <h2
        className="mt-5 text-[19px] font-semibold tracking-[-0.025em]"
        style={{ color: 'var(--mzaya-text-primary)' }}
      >
        {title}
      </h2>

      <p
        className="mx-auto mt-2 max-w-[320px] text-[13px] leading-6"
        style={{ color: 'var(--mzaya-text-muted)' }}
      >
        {message}
      </p>

      {onAction && (
        <Button onClick={onAction} className="mt-6 min-w-[160px]">
          {actionLabel}
        </Button>
      )}
    </section>
  )
}
