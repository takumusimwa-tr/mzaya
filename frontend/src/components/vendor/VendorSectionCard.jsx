/**
 * ============================================================================
 * MZAYA — VendorSectionCard
 * Path: frontend/src/components/vendor/VendorSectionCard.jsx
 * ----------------------------------------------------------------------------
 * Purpose
 * -------
 * Canonical surface container for titled vendor-console sections.
 *
 * Responsibilities
 * ----------------
 * • Provide consistent spacing, border, radius and heading hierarchy.
 * • Optionally display supporting text and a header action.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not fetch, mutate, navigate or own section content.
 * • Does not impose grid or list semantics on children.
 *
 * Accessibility
 * -------------
 * Uses a configurable semantic heading level. The supplied action must provide
 * its own accessible label when its visible text is insufficient.
 *
 * Canonical Component Policy
 * --------------------------
 * Reuse this component for vendor-console content surfaces instead of repeating
 * page-local card shells.
 *
 * Change Log
 * ----------
 * July 2026 — Premium vendor-console foundation.
 * ============================================================================
 */

export default function VendorSectionCard({
  title,
  description,
  action,
  children,
  headingAs: Heading = 'h2',
  className = '',
  bodyClassName = '',
}) {
  return (
    <section
      className={`rounded-[24px] border bg-white ${className}`}
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
    >
      <header className="flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <Heading
            className="text-[15px] font-semibold tracking-[-0.015em]"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            {title}
          </Heading>
          {description ? (
            <p
              className="mt-1 text-[11px] leading-5"
              style={{ color: 'var(--mzaya-text-secondary)' }}
            >
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>

      <div className={`p-5 sm:p-6 ${bodyClassName}`}>{children}</div>
    </section>
  )
}
