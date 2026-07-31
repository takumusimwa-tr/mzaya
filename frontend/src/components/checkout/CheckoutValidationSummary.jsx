/**
 * ============================================================================
 * MZAYA
 * Component: CheckoutValidationSummary
 * Path: frontend/src/components/checkout/CheckoutValidationSummary.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Summarizes checkout blockers before the customer attempts to place an order.
 *
 * Responsibilities
 * ----------------
 * • Render a compact, accessible list of unresolved checkout requirements.
 * • Allow each issue to expose an optional corrective action.
 * • Keep validation messages visually distinct from payment-processing errors.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not run validation logic.
 * • Does not decide whether checkout may proceed.
 * • Does not mutate checkout state directly.
 *
 * Data Contract
 * -------------
 * issues: Array<{
 *   id: string,
 *   message: string,
 *   actionLabel?: string,
 *   onAction?: function
 * }>
 *
 * Used By
 * -------
 * • CheckoutPage.jsx
 *
 * Developer Note
 * --------------
 * Keep issue copy actionable and specific, for example:
 * "Choose a delivery address" rather than "Address invalid."
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { AlertTriangle, ChevronRight } from 'lucide-react'

export default function CheckoutValidationSummary({
  issues = [],
  title = 'Complete these details',
  className = '',
}) {
  if (!issues.length) return null

  return (
    <section
      role="alert"
      aria-labelledby="checkout-validation-heading"
      className={`rounded-[20px] border p-4 ${className}`}
      style={{
        background: 'var(--mzaya-warning-soft)',
        borderColor: 'rgba(165, 106, 17, 0.18)',
      }}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          aria-hidden="true"
          className="mt-0.5 flex-shrink-0"
          size={18}
          strokeWidth={1.8}
          style={{ color: 'var(--mzaya-warning)' }}
        />

        <div className="min-w-0 flex-1">
          <h2
            id="checkout-validation-heading"
            className="text-[13px] font-semibold"
            style={{ color: 'var(--mzaya-warning)' }}
          >
            {title}
          </h2>

          <div className="mt-2 flex flex-col gap-2">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="flex items-center justify-between gap-3"
              >
                <p
                  className="text-[12px] leading-5"
                  style={{ color: 'var(--mzaya-text-secondary)' }}
                >
                  {issue.message}
                </p>

                {issue.onAction && (
                  <button
                    type="button"
                    onClick={issue.onAction}
                    className="inline-flex flex-shrink-0 items-center gap-1 text-[12px] font-semibold outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                    style={{ color: 'var(--mzaya-warning)' }}
                  >
                    {issue.actionLabel || 'Fix'}
                    <ChevronRight aria-hidden="true" size={14} strokeWidth={1.9} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
