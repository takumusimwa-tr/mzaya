/**
 * ============================================================================
 * MZAYA
 * Component: PaymentMethodCard
 * Path: frontend/src/components/checkout/PaymentMethodCard.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Displays one selectable payment method during checkout.
 *
 * Responsibilities
 * ----------------
 * • Present payment label, supporting text and optional icon.
 * • Communicate selected, disabled and unavailable states.
 * • Return the payment-method identifier through onSelect.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not tokenize cards or mobile-money credentials.
 * • Does not initiate payment.
 * • Does not store sensitive payment details.
 *
 * Data Contract
 * -------------
 * method: {
 *   id: string,
 *   label: string,
 *   description?: string,
 *   unavailableReason?: string,
 *   icon?: React component
 * }
 *
 * Security Note
 * -------------
 * Never pass raw card numbers, CVV values, PINs or wallet credentials into
 * this component. It should receive display-safe metadata only.
 *
 * Used By
 * -------
 * • CheckoutPage.jsx
 * • Future PaymentMethodSelector.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { Check, CreditCard } from 'lucide-react'

export default function PaymentMethodCard({
  method,
  selected = false,
  onSelect,
  disabled = false,
}) {
  const Icon = method.icon ?? CreditCard
  const isDisabled = disabled || Boolean(method.unavailableReason)

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={isDisabled}
      onClick={() => onSelect?.(method.id)}
      className="flex w-full items-start gap-3 rounded-[18px] border p-4 text-left outline-none transition-[transform,border-color,box-shadow,background-color] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
      style={{
        background: selected
          ? 'var(--mzaya-primary-soft)'
          : 'var(--mzaya-surface)',
        borderColor: selected
          ? 'var(--mzaya-primary)'
          : 'var(--mzaya-border)',
      }}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px]"
        style={{
          background: selected
            ? 'var(--mzaya-primary)'
            : 'var(--mzaya-surface-muted)',
          color: selected
            ? 'var(--mzaya-text-inverse)'
            : 'var(--mzaya-text-secondary)',
        }}
      >
        <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="text-[14px] font-semibold"
          style={{ color: 'var(--mzaya-text-primary)' }}
        >
          {method.label}
        </p>

        {(method.unavailableReason || method.description) && (
          <p
            className="mt-1 text-[12px] leading-5"
            style={{
              color: method.unavailableReason
                ? 'var(--mzaya-error)'
                : 'var(--mzaya-text-muted)',
            }}
          >
            {method.unavailableReason || method.description}
          </p>
        )}
      </div>

      <span
        className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border"
        style={{
          background: selected ? 'var(--mzaya-primary)' : 'transparent',
          borderColor: selected
            ? 'var(--mzaya-primary)'
            : 'var(--mzaya-border-strong)',
          color: 'var(--mzaya-text-inverse)',
        }}
        aria-hidden="true"
      >
        {selected && <Check size={14} strokeWidth={2.2} />}
      </span>
    </button>
  )
}
