/**
 * ============================================================================
 * MZAYA
 * Component: DeliveryTimingSelector
 * Path: frontend/src/components/checkout/DeliveryTimingSelector.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Lets the customer choose between immediate delivery and a scheduled delivery
 * window during checkout.
 *
 * Responsibilities
 * ----------------
 * • Render available timing options supplied by the parent page.
 * • Communicate the currently selected option.
 * • Return the selected option identifier through onChange.
 * • Preserve keyboard and screen-reader accessibility.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not calculate ETA values.
 * • Does not fetch delivery windows.
 * • Does not validate merchant operating hours.
 *
 * Data Contract
 * -------------
 * options: Array<{
 *   id: string,
 *   label: string,
 *   description?: string,
 *   disabled?: boolean
 * }>
 *
 * Dependencies
 * ------------
 * • lucide-react
 *
 * Used By
 * -------
 * • CheckoutPage.jsx, normally inside CheckoutSection.jsx.
 *
 * Design Notes
 * ------------
 * Use text-first option cards. Avoid large illustrations or bright competing
 * colors. The selected state uses the Mzaya primary color only as a cue.
 *
 * Future Enhancements
 * -------------------
 * • Merchant-specific time-slot grouping.
 * • Cut-off warnings for same-day scheduled delivery.
 * • Saved delivery preference.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { CalendarClock, Clock3 } from 'lucide-react'

const optionIcons = {
  asap: Clock3,
  scheduled: CalendarClock,
}

export default function DeliveryTimingSelector({
  options = [],
  value,
  onChange,
  disabled = false,
}) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2"
      role="radiogroup"
      aria-label="Delivery timing"
    >
      {options.map((option) => {
        const isSelected = option.id === value
        const Icon = optionIcons[option.id] ?? Clock3
        const isDisabled = disabled || option.disabled

        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isDisabled}
            onClick={() => onChange?.(option.id)}
            className="flex min-h-[104px] items-start gap-3 rounded-[18px] border p-4 text-left outline-none transition-[transform,border-color,box-shadow,background-color] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{
              background: isSelected
                ? 'var(--mzaya-primary-soft)'
                : 'var(--mzaya-surface)',
              borderColor: isSelected
                ? 'var(--mzaya-primary)'
                : 'var(--mzaya-border)',
            }}
          >
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px]"
              style={{
                background: isSelected
                  ? 'var(--mzaya-primary)'
                  : 'var(--mzaya-surface-muted)',
                color: isSelected
                  ? 'var(--mzaya-text-inverse)'
                  : 'var(--mzaya-text-secondary)',
              }}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
              <p
                className="text-[14px] font-semibold"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                {option.label}
              </p>

              {option.description && (
                <p
                  className="mt-1 text-[12px] leading-5"
                  style={{ color: 'var(--mzaya-text-muted)' }}
                >
                  {option.description}
                </p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
