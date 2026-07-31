/**
 * ============================================================================
 * MZAYA
 * Component: PaymentSuccessState
 * Path: frontend/src/components/payment/PaymentSuccessState.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Confirms that payment was received and directs the customer into order
 * tracking or order details.
 *
 * Responsibilities
 * ----------------
 * • Display payment confirmation in plain language.
 * • Show the order reference and paid amount when available.
 * • Provide one clear next action.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not create the order.
 * • Does not verify payment independently.
 * • Does not clear the cart.
 *
 * Trust Note
 * ----------
 * Only render this state after the backend has verified the provider result.
 * A frontend redirect or query parameter must never be treated as proof of
 * successful payment.
 *
 * Dependencies
 * ------------
 * • Button.jsx
 * • Money.jsx
 * • lucide-react
 *
 * Used By
 * -------
 * • PaymentPage.jsx
 * • OrderConfirmationPage.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { Check } from 'lucide-react'
import Button from '../ui/Button'
import Money from '../ui/Money'

export default function PaymentSuccessState({
  title = 'Payment received',
  message = 'Your order is confirmed. We’ll notify you when the rider is on the way.',
  orderReference,
  amount,
  onContinue,
  actionLabel = 'Track order',
}) {
  return (
    <section
      className="rounded-[24px] border bg-white px-6 py-10 text-center"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-labelledby="payment-success-title"
    >
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          background: 'var(--mzaya-success)',
          color: 'var(--mzaya-text-inverse)',
        }}
      >
        <Check aria-hidden="true" size={25} strokeWidth={2.2} />
      </div>

      <h2
        id="payment-success-title"
        className="mt-5 text-[22px] font-semibold tracking-[-0.03em]"
        style={{ color: 'var(--mzaya-text-primary)' }}
      >
        {title}
      </h2>

      <p
        className="mx-auto mt-2 max-w-[340px] text-[14px] leading-6"
        style={{ color: 'var(--mzaya-text-secondary)' }}
      >
        {message}
      </p>

      {(orderReference || amount != null) && (
        <div
          className="mx-auto mt-6 max-w-[320px] rounded-[18px] border px-4 py-3"
          style={{
            background: 'var(--mzaya-surface-subtle)',
            borderColor: 'var(--mzaya-border)',
          }}
        >
          {orderReference && (
            <div className="flex items-center justify-between gap-4">
              <span
                className="text-[12px]"
                style={{ color: 'var(--mzaya-text-muted)' }}
              >
                Order
              </span>
              <span
                className="text-[12px] font-semibold"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                {orderReference}
              </span>
            </div>
          )}

          {amount != null && (
            <div className={`flex items-center justify-between gap-4 ${orderReference ? 'mt-2' : ''}`}>
              <span
                className="text-[12px]"
                style={{ color: 'var(--mzaya-text-muted)' }}
              >
                Paid
              </span>
              <Money usd={amount} size="base" />
            </div>
          )}
        </div>
      )}

      <Button
        onClick={onContinue}
        className="mt-7 min-w-[180px]"
      >
        {actionLabel}
      </Button>
    </section>
  )
}
