/**
 * ============================================================================
 * MZAYA
 * Component: PaymentFailureState
 * Path: frontend/src/components/payment/PaymentFailureState.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Explains that a payment attempt was unsuccessful and gives the customer a
 * safe route to retry or choose another payment method.
 *
 * Responsibilities
 * ----------------
 * • Present direct failure copy without technical jargon.
 * • Offer retry and alternative-method actions.
 * • Display an optional reference code for support.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not retry payment automatically.
 * • Does not expose raw gateway error payloads.
 * • Does not determine whether the order remains reserved.
 *
 * Security Note
 * -------------
 * Never display provider secrets, authorization tokens, raw webhook payloads,
 * card details, wallet credentials, or internal stack traces.
 *
 * Dependencies
 * ------------
 * • Button.jsx
 * • lucide-react
 *
 * Used By
 * -------
 * • PaymentPage.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { AlertCircle } from 'lucide-react'
import Button from '../ui/Button'

export default function PaymentFailureState({
  title = 'Payment failed',
  message = 'Try again or choose another payment method.',
  reference,
  onRetry,
  onChangeMethod,
  retrying = false,
}) {
  return (
    <section
      className="rounded-[24px] border bg-white px-6 py-10 text-center"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      role="alert"
    >
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px]"
        style={{
          background: 'var(--mzaya-error-soft)',
          color: 'var(--mzaya-error)',
        }}
      >
        <AlertCircle aria-hidden="true" size={25} strokeWidth={1.7} />
      </div>

      <h2
        className="mt-5 text-[20px] font-semibold tracking-[-0.025em]"
        style={{ color: 'var(--mzaya-text-primary)' }}
      >
        {title}
      </h2>

      <p
        className="mx-auto mt-2 max-w-[320px] text-[14px] leading-6"
        style={{ color: 'var(--mzaya-text-secondary)' }}
      >
        {message}
      </p>

      {reference && (
        <p
          className="mt-3 text-[11px] font-medium tracking-[0.04em]"
          style={{ color: 'var(--mzaya-text-muted)' }}
        >
          Reference: {reference}
        </p>
      )}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          onClick={onRetry}
          loading={retrying}
          className="sm:min-w-[150px]"
        >
          Try again
        </Button>

        {onChangeMethod && (
          <Button
            variant="outline"
            onClick={onChangeMethod}
            disabled={retrying}
            className="sm:min-w-[190px]"
          >
            Choose another method
          </Button>
        )}
      </div>
    </section>
  )
}
