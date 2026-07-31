/**
 * ============================================================================
 * MZAYA
 * Component: PaymentProcessingState
 * Path: frontend/src/components/payment/PaymentProcessingState.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Communicates that Mzaya is waiting for a payment provider to complete or
 * confirm a transaction.
 *
 * Responsibilities
 * ----------------
 * • Display a calm, unambiguous processing state.
 * • Prevent accidental repeated payment attempts.
 * • Explain that the customer should keep the page open.
 * • Support optional payment-method-specific context.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not initiate payment.
 * • Does not poll payment status.
 * • Does not decide when processing has timed out.
 *
 * Used By
 * -------
 * • PaymentPage.jsx
 * • CheckoutPage.jsx when payment is completed inline.
 *
 * Product Note
 * ------------
 * Do not use celebratory animation during payment processing. The customer
 * needs confidence and clarity, not entertainment.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { CreditCard } from 'lucide-react'

export default function PaymentProcessingState({
  title = 'Confirming your payment',
  message = 'Keep this page open while we receive confirmation.',
  methodLabel,
}) {
  return (
    <section
      className="rounded-[24px] border bg-white px-6 py-12 text-center"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px]"
        style={{
          background: 'var(--mzaya-primary-soft)',
          color: 'var(--mzaya-primary)',
        }}
      >
        <CreditCard aria-hidden="true" size={24} strokeWidth={1.7} />
      </div>

      <div
        className="mx-auto mt-5 h-5 w-5 animate-spin rounded-full border-2 border-r-transparent"
        style={{ borderColor: 'var(--mzaya-primary)', borderRightColor: 'transparent' }}
        aria-hidden="true"
      />

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

      {methodLabel && (
        <p
          className="mt-3 text-[12px] font-medium"
          style={{ color: 'var(--mzaya-text-muted)' }}
        >
          Payment method: {methodLabel}
        </p>
      )}
    </section>
  )
}
