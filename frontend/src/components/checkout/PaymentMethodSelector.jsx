/**
 * ============================================================================
 * MZAYA
 * Component: PaymentMethodSelector
 * Path: frontend/src/components/checkout/PaymentMethodSelector.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Groups all checkout payment options into one accessible selection control.
 *
 * Responsibilities
 * ----------------
 * • Render PaymentMethodCard for each supplied option.
 * • Maintain a single radio-group relationship.
 * • Forward the selected payment-method identifier to the parent.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not own the authoritative checkout state.
 * • Does not call payment gateways.
 * • Does not decide which methods are available.
 *
 * Dependencies
 * ------------
 * • PaymentMethodCard.jsx
 *
 * Used By
 * -------
 * • CheckoutPage.jsx, normally inside CheckoutSection.jsx.
 *
 * Developer Note
 * --------------
 * Availability should be determined by backend capability, merchant rules,
 * customer location and currency. Do not hard-code method availability here.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import PaymentMethodCard from './PaymentMethodCard'

export default function PaymentMethodSelector({
  methods = [],
  value,
  onChange,
  disabled = false,
}) {
  return (
    <div
      className="flex flex-col gap-3"
      role="radiogroup"
      aria-label="Payment method"
    >
      {methods.map((method) => (
        <PaymentMethodCard
          key={method.id}
          method={method}
          selected={method.id === value}
          onSelect={onChange}
          disabled={disabled}
        />
      ))}
    </div>
  )
}
