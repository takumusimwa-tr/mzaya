/**
 * ============================================================================
 * MZAYA
 * Component: NotificationPreferenceRow
 * Path: frontend/src/components/profile/NotificationPreferenceRow.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Represents one customer-controlled notification preference.
 *
 * Responsibilities
 * ----------------
 * • Display a preference label and supporting description.
 * • Render an accessible switch.
 * • Forward changes to the parent.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not persist preference changes.
 * • Does not request operating-system notification permissions.
 * • Does not decide which notifications are legally mandatory.
 *
 * Used By
 * -------
 * • NotificationSettingsPage.jsx
 *
 * Accessibility Note
 * ------------------
 * The switch uses role="switch" and aria-checked so screen readers announce the
 * current state correctly.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

export default function NotificationPreferenceRow({
  id,
  label,
  description,
  checked = false,
  disabled = false,
  onChange,
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-4">
      <div className="min-w-0 flex-1">
        <label
          htmlFor={id}
          className="text-[14px] font-medium"
          style={{ color: 'var(--mzaya-text-primary)' }}
        >
          {label}
        </label>

        {description && (
          <p
            className="mt-1 text-[12px] leading-5"
            style={{ color: 'var(--mzaya-text-muted)' }}
          >
            {description}
          </p>
        )}
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className="relative h-7 w-12 flex-shrink-0 rounded-full outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-45 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
        style={{
          background: checked
            ? 'var(--mzaya-primary)'
            : 'var(--mzaya-border-strong)',
        }}
      >
        <span
          aria-hidden="true"
          className="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform"
          style={{
            left: '4px',
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  )
}
