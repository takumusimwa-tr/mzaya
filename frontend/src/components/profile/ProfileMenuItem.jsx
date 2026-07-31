/**
 * ============================================================================
 * MZAYA
 * Component: ProfileMenuItem
 * Path: frontend/src/components/profile/ProfileMenuItem.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Represents one navigational or account action within the profile page.
 *
 * Responsibilities
 * ----------------
 * • Display an icon, label and optional supporting text.
 * • Expose an action through onClick.
 * • Support optional badges or trailing values.
 * • Distinguish destructive actions without overwhelming the page.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not navigate directly.
 * • Does not confirm destructive actions.
 * • Does not mutate account state.
 *
 * Dependencies
 * ------------
 * • lucide-react
 *
 * Used By
 * -------
 * • ProfileMenuSection.jsx
 * • ProfilePage.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { ChevronRight } from 'lucide-react'

export default function ProfileMenuItem({
  icon: Icon,
  label,
  description,
  value,
  badge,
  onClick,
  destructive = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-3 px-4 py-4 text-left outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-45 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
    >
      {Icon && (
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px]"
          style={{
            background: destructive
              ? 'var(--mzaya-error-soft)'
              : 'var(--mzaya-surface-muted)',
            color: destructive
              ? 'var(--mzaya-error)'
              : 'var(--mzaya-text-secondary)',
          }}
        >
          <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p
          className="text-[14px] font-medium"
          style={{
            color: destructive
              ? 'var(--mzaya-error)'
              : 'var(--mzaya-text-primary)',
          }}
        >
          {label}
        </p>

        {description && (
          <p
            className="mt-1 text-[12px] leading-5"
            style={{ color: 'var(--mzaya-text-muted)' }}
          >
            {description}
          </p>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        {badge && (
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
            style={{
              background: 'var(--mzaya-primary-soft)',
              color: 'var(--mzaya-primary)',
            }}
          >
            {badge}
          </span>
        )}

        {value && (
          <span
            className="max-w-[110px] truncate text-[12px]"
            style={{ color: 'var(--mzaya-text-muted)' }}
          >
            {value}
          </span>
        )}

        <ChevronRight
          aria-hidden="true"
          size={16}
          strokeWidth={1.8}
          style={{ color: 'var(--mzaya-text-muted)' }}
        />
      </div>
    </button>
  )
}
