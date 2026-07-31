/**
 * ============================================================================
 * MZAYA
 * Component: PromoCodeField
 * Path: frontend/src/components/checkout/PromoCodeField.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Collects and submits an optional promotional code during checkout.
 *
 * Responsibilities
 * ----------------
 * • Render a controlled promo-code input.
 * • Trigger promo validation through the parent-provided onApply handler.
 * • Display loading, success and error states.
 * • Allow a successfully applied code to be removed.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not validate promo rules locally.
 * • Does not calculate discounts.
 * • Does not persist promotional data.
 *
 * Data Contract
 * -------------
 * value: string
 * onChange: function(nextValue)
 * onApply: function()
 * onRemove?: function()
 * status?: 'idle' | 'loading' | 'success' | 'error'
 * message?: string
 *
 * Backend Integration Note
 * ------------------------
 * Promo eligibility, expiry, merchant restrictions, minimum order values and
 * discount amounts must be determined by the backend. The UI only presents the
 * result returned by the checkout service.
 *
 * Dependencies
 * ------------
 * • Button.jsx
 * • lucide-react
 *
 * Used By
 * -------
 * • CheckoutPage.jsx, normally inside CheckoutSection.jsx.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { CheckCircle2, Tag, X } from 'lucide-react'
import Button from '../ui/Button'

export default function PromoCodeField({
  value = '',
  onChange,
  onApply,
  onRemove,
  status = 'idle',
  message,
  disabled = false,
}) {
  const isLoading = status === 'loading'
  const isApplied = status === 'success'
  const hasError = status === 'error'
  const canApply = value.trim().length > 0 && !disabled && !isLoading

  const handleSubmit = (event) => {
    event.preventDefault()
    if (canApply) onApply?.()
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Tag
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
            size={17}
            strokeWidth={1.8}
            style={{ color: 'var(--mzaya-text-muted)' }}
          />

          <input
            type="text"
            value={value}
            onChange={(event) => onChange?.(event.target.value.toUpperCase())}
            placeholder="Enter promo code"
            disabled={disabled || isApplied}
            aria-invalid={hasError ? 'true' : undefined}
            aria-describedby={message ? 'mzaya-promo-message' : undefined}
            className="min-h-12 w-full rounded-[14px] border bg-white pl-11 pr-4 text-[14px] font-medium uppercase tracking-[0.04em] outline-none transition-[border-color,box-shadow] placeholder:normal-case placeholder:tracking-normal placeholder:text-[var(--mzaya-text-muted)] disabled:cursor-not-allowed disabled:opacity-55 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{
              color: 'var(--mzaya-text-primary)',
              borderColor: hasError
                ? 'var(--mzaya-error)'
                : isApplied
                  ? 'var(--mzaya-success)'
                  : 'var(--mzaya-border)',
            }}
          />
        </div>

        {isApplied ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove promo code"
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] border bg-white outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{
              borderColor: 'var(--mzaya-border)',
              color: 'var(--mzaya-text-secondary)',
            }}
          >
            <X aria-hidden="true" size={18} strokeWidth={1.9} />
          </button>
        ) : (
          <Button
            type="submit"
            variant="secondary"
            loading={isLoading}
            disabled={!canApply}
            className="min-w-[92px]"
          >
            Apply
          </Button>
        )}
      </div>

      {message && (
        <div
          id="mzaya-promo-message"
          className="mt-2 flex items-start gap-2 text-[12px] leading-5"
          role={hasError ? 'alert' : undefined}
          style={{
            color: hasError
              ? 'var(--mzaya-error)'
              : isApplied
                ? 'var(--mzaya-success)'
                : 'var(--mzaya-text-muted)',
          }}
        >
          {isApplied && (
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 flex-shrink-0"
              size={14}
              strokeWidth={1.9}
            />
          )}
          <span>{message}</span>
        </div>
      )}
    </form>
  )
}
