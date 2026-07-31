/**
 * ============================================================================
 * MZAYA
 * Component: VendorFormSection
 * Path: frontend/src/components/vendor/VendorFormSection.jsx
 * ----------------------------------------------------------------------------
 * Purpose
 * -------
 * Canonical section container for vendor settings and onboarding forms.
 *
 * Responsibilities
 * ----------------
 * • Groups related fields under a title and optional description.
 * • Provides consistent premium spacing, borders and responsive layout.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not own field state, validation, submission or persistence.
 *
 * Accessibility
 * -------------
 * Uses a semantic section and associates its heading through aria-labelledby.
 *
 * Dependencies
 * ------------
 * React only.
 *
 * Canonical Component Policy
 * --------------------------
 * Reuse this component for vendor business-management form groupings instead
 * of creating page-specific white-card wrappers.
 *
 * Change Log
 * ----------
 * July 2026 — Initial premium vendor implementation.
 * ============================================================================
 */

import { useId } from 'react'

export default function VendorFormSection({
  title,
  description,
  aside,
  children,
  className = '',
}) {
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className={`rounded-[24px] border bg-white p-5 sm:p-6 ${className}`}
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id={headingId}
            className="text-[16px] font-semibold tracking-[-0.02em]"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            {title}
          </h2>
          {description && (
            <p
              className="mt-1 max-w-2xl text-[11px] leading-5"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              {description}
            </p>
          )}
        </div>
        {aside}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  )
}
