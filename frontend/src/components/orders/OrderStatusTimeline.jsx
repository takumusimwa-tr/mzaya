/**
 * ============================================================================
 * MZAYA
 * Component: OrderStatusTimeline
 * Path: frontend/src/components/orders/OrderStatusTimeline.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Presents the customer's order journey as a clear sequence of status steps.
 *
 * Responsibilities
 * ----------------
 * • Render all order milestones supplied by the parent page.
 * • Distinguish completed, current and upcoming steps.
 * • Display optional timestamps and supporting descriptions.
 * • Preserve accessible list semantics.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not poll order status.
 * • Does not infer which status is current.
 * • Does not calculate ETA values.
 *
 * Data Contract
 * -------------
 * steps: Array<{
 *   id: string,
 *   label: string,
 *   description?: string,
 *   timestamp?: string,
 *   state: 'complete' | 'current' | 'upcoming'
 * }>
 *
 * Used By
 * -------
 * • OrderTrackingPage.jsx
 * • OrderDetailsPage.jsx
 *
 * Design Notes
 * ------------
 * The current step should be the strongest visual cue. Completed steps remain
 * clear but quieter. Upcoming steps should never appear disabled or alarming.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { Check } from 'lucide-react'

export default function OrderStatusTimeline({ steps = [] }) {
  return (
    <ol className="flex flex-col" aria-label="Order progress">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        const isComplete = step.state === 'complete'
        const isCurrent = step.state === 'current'

        return (
          <li key={step.id} className="relative flex gap-4">
            {!isLast && (
              <span
                aria-hidden="true"
                className="absolute left-[17px] top-9 h-[calc(100%-0.25rem)] w-px"
                style={{
                  background:
                    isComplete
                      ? 'var(--mzaya-primary)'
                      : 'var(--mzaya-border)',
                }}
              />
            )}

            <div
              className="relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border"
              style={{
                background: isComplete || isCurrent
                  ? 'var(--mzaya-primary)'
                  : 'var(--mzaya-surface)',
                borderColor: isComplete || isCurrent
                  ? 'var(--mzaya-primary)'
                  : 'var(--mzaya-border-strong)',
                color: isComplete || isCurrent
                  ? 'var(--mzaya-text-inverse)'
                  : 'var(--mzaya-text-muted)',
              }}
            >
              {isComplete ? (
                <Check aria-hidden="true" size={16} strokeWidth={2.2} />
              ) : (
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: isCurrent
                      ? 'var(--mzaya-text-inverse)'
                      : 'var(--mzaya-border-strong)',
                  }}
                />
              )}
            </div>

            <div className={`min-w-0 flex-1 ${isLast ? 'pb-0' : 'pb-6'}`}>
              <div className="flex items-start justify-between gap-4">
                <p
                  className="text-[14px] font-semibold"
                  style={{
                    color: isCurrent
                      ? 'var(--mzaya-primary)'
                      : 'var(--mzaya-text-primary)',
                  }}
                >
                  {step.label}
                </p>

                {step.timestamp && (
                  <span
                    className="flex-shrink-0 text-[11px]"
                    style={{ color: 'var(--mzaya-text-muted)' }}
                  >
                    {step.timestamp}
                  </span>
                )}
              </div>

              {step.description && (
                <p
                  className="mt-1 text-[12px] leading-5"
                  style={{ color: 'var(--mzaya-text-muted)' }}
                >
                  {step.description}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
