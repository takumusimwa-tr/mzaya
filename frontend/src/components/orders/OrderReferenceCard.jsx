/**
 * ============================================================================
 * MZAYA
 * Component: OrderReferenceCard
 * Path: frontend/src/components/orders/OrderReferenceCard.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Displays the order reference, merchant and order creation time at the top of
 * an order-tracking or order-details page.
 *
 * Responsibilities
 * ----------------
 * • Present the order reference prominently.
 * • Show merchant name and optional placed-at text.
 * • Expose an optional copy-reference action.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not fetch order metadata.
 * • Does not write to the clipboard directly.
 * • Does not infer merchant or order status.
 *
 * Used By
 * -------
 * • OrderTrackingPage.jsx
 * • OrderDetailsPage.jsx
 *
 * Developer Note
 * --------------
 * Clipboard behavior should remain in the parent page so permission failures
 * and success feedback can be handled consistently.
 *
 * Dependencies
 * ------------
 * • lucide-react
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { Copy, Store } from 'lucide-react'

export default function OrderReferenceCard({
  reference,
  merchantName,
  placedAt,
  onCopy,
}) {
  return (
    <section
      className="rounded-[22px] border bg-white p-5"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-labelledby="order-reference-heading"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.08em]"
            style={{ color: 'var(--mzaya-text-muted)' }}
          >
            Order
          </p>

          <h2
            id="order-reference-heading"
            className="mt-1 text-[20px] font-semibold tracking-[-0.025em]"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            {reference || 'Reference unavailable'}
          </h2>
        </div>

        {reference && onCopy && (
          <button
            type="button"
            onClick={onCopy}
            aria-label="Copy order reference"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border bg-white outline-none transition-transform active:scale-95 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{
              borderColor: 'var(--mzaya-border)',
              color: 'var(--mzaya-text-secondary)',
            }}
          >
            <Copy aria-hidden="true" size={17} strokeWidth={1.8} />
          </button>
        )}
      </div>

      {(merchantName || placedAt) && (
        <div
          className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-4"
          style={{ borderColor: 'var(--mzaya-border)' }}
        >
          {merchantName && (
            <div className="flex items-center gap-2">
              <Store
                aria-hidden="true"
                size={15}
                strokeWidth={1.8}
                style={{ color: 'var(--mzaya-text-muted)' }}
              />
              <span
                className="text-[12px] font-medium"
                style={{ color: 'var(--mzaya-text-secondary)' }}
              >
                {merchantName}
              </span>
            </div>
          )}

          {placedAt && (
            <span
              className="text-[12px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              {placedAt}
            </span>
          )}
        </div>
      )}
    </section>
  )
}
