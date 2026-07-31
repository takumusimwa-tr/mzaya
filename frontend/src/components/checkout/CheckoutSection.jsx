/**
 * ============================================================================
 * MZAYA
 * Component: CheckoutSection
 * Path: frontend/src/components/checkout/CheckoutSection.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Provides the shared visual container used by checkout sections such as
 * delivery address, delivery timing, payment method, and order instructions.
 *
 * Responsibilities
 * ----------------
 * • Standardize headings, supporting text, spacing, borders and actions.
 * • Allow any checkout-specific content to be passed through children.
 * • Keep section-level interaction controls visually consistent.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not own checkout state.
 * • Does not validate form data.
 * • Does not call checkout or payment APIs.
 *
 * Used By
 * -------
 * • CheckoutPage.jsx
 * • Future scheduled-order and procurement checkout flows.
 *
 * Design Notes
 * ------------
 * Checkout should read as one composed sequence. Avoid nesting extra cards
 * inside this component unless the nested item represents a distinct choice.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

export default function CheckoutSection({
  id,
  title,
  description,
  action,
  children,
  className = '',
}) {
  const headingId = id ? `${id}-heading` : undefined

  return (
    <section
      className={`rounded-[22px] border bg-white p-5 ${className}`}
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-labelledby={headingId}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2
            id={headingId}
            className="text-[17px] font-semibold tracking-[-0.015em]"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            {title}
          </h2>

          {description && (
            <p
              className="mt-1 text-[13px] leading-5"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              {description}
            </p>
          )}
        </div>

        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      <div className="mt-4">{children}</div>
    </section>
  )
}
