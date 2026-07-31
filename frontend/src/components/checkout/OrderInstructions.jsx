/**
 * ============================================================================
 * MZAYA
 * Component: OrderInstructions
 * Path: frontend/src/components/checkout/OrderInstructions.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Collects optional delivery or merchant-facing instructions during checkout.
 *
 * Responsibilities
 * ----------------
 * • Provide a controlled textarea.
 * • Show remaining character capacity.
 * • Preserve accessible labels and help text.
 * • Prevent input beyond the configured maximum length.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not sanitize or persist instructions.
 * • Does not determine which party receives the note.
 * • Does not replace structured address or contact fields.
 *
 * Data Contract
 * -------------
 * value: string
 * onChange: function(nextValue)
 *
 * Used By
 * -------
 * • CheckoutPage.jsx, normally inside CheckoutSection.jsx.
 *
 * Safety / Product Note
 * ---------------------
 * The parent page should avoid placing highly sensitive personal information
 * into order notes. Structured contact and access data should use dedicated
 * fields whenever available.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

export default function OrderInstructions({
  value = '',
  onChange,
  maxLength = 240,
  placeholder = 'Gate details, landmarks, or instructions for the courier',
  disabled = false,
}) {
  const remaining = Math.max(maxLength - value.length, 0)

  return (
    <div>
      <label
        htmlFor="mzaya-order-instructions"
        className="sr-only"
      >
        Order instructions
      </label>

      <textarea
        id="mzaya-order-instructions"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        maxLength={maxLength}
        disabled={disabled}
        rows={4}
        placeholder={placeholder}
        className="w-full resize-none rounded-[16px] border bg-white px-4 py-3 text-[14px] leading-6 outline-none transition-[border-color,box-shadow] placeholder:text-[var(--mzaya-text-muted)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
        style={{
          color: 'var(--mzaya-text-primary)',
          borderColor: 'var(--mzaya-border)',
        }}
      />

      <div className="mt-2 flex items-center justify-between gap-3">
        <p
          className="text-[11px] leading-4"
          style={{ color: 'var(--mzaya-text-muted)' }}
        >
          Do not include payment credentials or private account information.
        </p>

        <span
          className="flex-shrink-0 text-[11px] font-medium"
          style={{
            color:
              remaining <= 20
                ? 'var(--mzaya-warning)'
                : 'var(--mzaya-text-muted)',
          }}
          aria-live="polite"
        >
          {remaining}
        </span>
      </div>
    </div>
  )
}
