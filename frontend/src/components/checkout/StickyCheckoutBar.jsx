/**
 * ============================================================================
 * MZAYA
 * Component: StickyCheckoutBar
 * Path: frontend/src/components/checkout/StickyCheckoutBar.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Provides the persistent bottom action used to move from Cart to Checkout or
 * to place an order from Checkout.
 *
 * Responsibilities
 * ----------------
 * • Keep the total and primary action visible on mobile.
 * • Respect device safe-area insets.
 * • Communicate loading and disabled states through Button.jsx.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not calculate order totals.
 * • Does not validate checkout data.
 * • Does not perform navigation or API calls by itself.
 *
 * Dependencies
 * ------------
 * • Button.jsx
 * • Money.jsx
 *
 * Used By
 * -------
 * • CartPage.jsx
 * • CheckoutPage.jsx
 *
 * Design Notes
 * ------------
 * This is the highest-priority action on transactional pages. Do not add a
 * second competing primary button inside the same viewport.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import Button from '../ui/Button'
import Money from '../ui/Money'

export default function StickyCheckoutBar({
  total,
  label = 'Continue to checkout',
  onContinue,
  loading = false,
  disabled = false,
  helperText,
}) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 px-4 pt-3 backdrop-blur"
      style={{
        borderColor: 'var(--mzaya-border)',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        boxShadow: '0 -12px 34px rgba(18, 23, 20, 0.07)',
      }}
    >
      <div className="mx-auto flex w-full max-w-3xl items-center gap-4">
        <div className="min-w-0 flex-1">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.08em]"
            style={{ color: 'var(--mzaya-text-muted)' }}
          >
            Total
          </p>
          <Money usd={total} size="lg" />

          {helperText && (
            <p
              className="mt-0.5 truncate text-[10px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              {helperText}
            </p>
          )}
        </div>

        <Button
          onClick={onContinue}
          loading={loading}
          disabled={disabled}
          size="md"
          className="min-w-[176px]"
        >
          {label}
        </Button>
      </div>
    </div>
  )
}
