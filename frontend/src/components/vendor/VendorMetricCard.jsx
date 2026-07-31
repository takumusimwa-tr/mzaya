/**
 * ============================================================================
 * MZAYA — VendorMetricCard
 * Path: frontend/src/components/vendor/VendorMetricCard.jsx
 * ----------------------------------------------------------------------------
 * Purpose
 * -------
 * Canonical compact metric card for the vendor console.
 *
 * Responsibilities
 * ----------------
 * • Present a label, value, supporting note and optional icon.
 * • Provide a consistent semantic treatment for operational dashboard metrics.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not calculate values or format domain data.
 * • Does not fetch, mutate, navigate or own business state.
 *
 * Props
 * -----
 * label: string
 * value: ReactNode
 * note?: ReactNode
 * icon?: Lucide icon component
 * emphasis?: 'default' | 'primary' | 'warning'
 *
 * Accessibility
 * -------------
 * Icons are decorative; the text remains the accessible source of truth.
 *
 * Canonical Component Policy
 * --------------------------
 * Reuse this component for vendor-console summary metrics instead of creating
 * page-local metric tiles.
 *
 * Change Log
 * ----------
 * July 2026 — Premium vendor-console foundation.
 * ============================================================================
 */

const EMPHASIS = {
  default: {
    iconBackground: 'var(--mzaya-surface-subtle)',
    iconColor: 'var(--mzaya-text-secondary)',
    valueColor: 'var(--mzaya-text-primary)',
  },
  primary: {
    iconBackground: 'var(--mzaya-green-50)',
    iconColor: 'var(--mzaya-green-700)',
    valueColor: 'var(--mzaya-green-800)',
  },
  warning: {
    iconBackground: '#FFF8E1',
    iconColor: '#9A6700',
    valueColor: '#7A5200',
  },
}

export default function VendorMetricCard({
  label,
  value,
  note,
  icon: Icon,
  emphasis = 'default',
}) {
  const palette = EMPHASIS[emphasis] ?? EMPHASIS.default

  return (
    <article
      className="rounded-[22px] border bg-white p-5"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.13em]"
            style={{ color: 'var(--mzaya-text-secondary)' }}
          >
            {label}
          </p>
          <p
            className="mt-2 truncate text-[26px] font-semibold tracking-[-0.035em]"
            style={{ color: palette.valueColor }}
          >
            {value}
          </p>
          {note ? (
            <p
              className="mt-1 text-[11px] leading-5"
              style={{ color: 'var(--mzaya-text-secondary)' }}
            >
              {note}
            </p>
          ) : null}
        </div>

        {Icon ? (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]"
            style={{
              background: palette.iconBackground,
              color: palette.iconColor,
            }}
            aria-hidden="true"
          >
            <Icon size={19} strokeWidth={1.8} />
          </div>
        ) : null}
      </div>
    </article>
  )
}
