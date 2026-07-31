/**
 * ============================================================================
 * MZAYA
 * Component: VendorBusinessHoursRow
 * Path: frontend/src/components/vendor/VendorBusinessHoursRow.jsx
 * ----------------------------------------------------------------------------
 * Purpose
 * -------
 * Canonical editable row for one day of vendor operating hours.
 *
 * Responsibilities
 * ----------------
 * • Displays open/close time controls and closed-day toggle.
 * • Forwards patches to the parent-owned hours state.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not validate business logic or persist changes.
 *
 * Accessibility
 * -------------
 * Time fields have explicit labels; the closed toggle exposes pressed state.
 *
 * Change Log
 * ----------
 * July 2026 — Initial premium vendor implementation.
 * ============================================================================
 */

export default function VendorBusinessHoursRow({
  dayKey,
  label,
  value,
  onChange,
}) {
  const closed = Boolean(value?.closed)

  return (
    <div
      className="grid gap-3 border-b py-4 last:border-b-0 sm:grid-cols-[130px_1fr_auto] sm:items-center"
      style={{ borderColor: 'var(--mzaya-border)' }}
    >
      <p
        className="text-[12px] font-semibold"
        style={{ color: 'var(--mzaya-text-primary)' }}
      >
        {label}
      </p>

      {closed ? (
        <p className="text-[11px]" style={{ color: 'var(--mzaya-text-muted)' }}>
          Closed all day
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`${dayKey}-open`}>{label} opening time</label>
          <input
            id={`${dayKey}-open`}
            type="time"
            value={value?.open || '08:00'}
            onChange={(event) => onChange({ open: event.target.value })}
            className="rounded-[12px] border bg-white px-3 py-2.5 text-[12px] outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{
              borderColor: 'var(--mzaya-border)',
              color: 'var(--mzaya-text-primary)',
            }}
          />
          <span className="text-[10px]" style={{ color: 'var(--mzaya-text-muted)' }}>to</span>
          <label className="sr-only" htmlFor={`${dayKey}-close`}>{label} closing time</label>
          <input
            id={`${dayKey}-close`}
            type="time"
            value={value?.close || '22:00'}
            onChange={(event) => onChange({ close: event.target.value })}
            className="rounded-[12px] border bg-white px-3 py-2.5 text-[12px] outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{
              borderColor: 'var(--mzaya-border)',
              color: 'var(--mzaya-text-primary)',
            }}
          />
        </div>
      )}

      <button
        type="button"
        aria-pressed={closed}
        onClick={() => onChange({ closed: !closed })}
        className="justify-self-start rounded-[12px] px-3 py-2 text-[10px] font-semibold outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)] sm:justify-self-end"
        style={{
          background: closed
            ? 'var(--mzaya-primary-soft)'
            : 'var(--mzaya-surface-muted)',
          color: closed
            ? 'var(--mzaya-primary)'
            : 'var(--mzaya-text-secondary)',
        }}
      >
        {closed ? 'Set open' : 'Mark closed'}
      </button>
    </div>
  )
}
