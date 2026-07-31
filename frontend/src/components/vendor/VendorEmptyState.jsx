/**
 * ============================================================================
 * MZAYA
 * Component: VendorEmptyState
 * Path: frontend/src/components/vendor/VendorEmptyState.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Canonical empty-state presentation for vendor operational screens.
 *
 * Responsibilities
 * ----------------
 * • Display a concise title, supporting message and optional action.
 * • Preserve consistent spacing, typography and focus treatment.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not navigate.
 * • Does not fetch or mutate data.
 *
 * Accessibility
 * -------------
 * Uses a labelled region and keeps any action as a native button.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial canonical component.
 * ============================================================================
 */

import { Inbox } from 'lucide-react'

export default function VendorEmptyState({
  icon: Icon = Inbox,
  title,
  message,
  actionLabel,
  onAction,
  compact = false,
}) {
  return (
    <section
      className={`rounded-[24px] border bg-white text-center ${
        compact ? 'px-5 py-8' : 'px-6 py-12'
      }`}
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-label={title}
    >
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px]"
        style={{
          background: 'var(--mzaya-primary-soft)',
          color: 'var(--mzaya-primary)',
        }}
      >
        <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
      </div>

      <h2
        className="mt-4 text-[18px] font-semibold tracking-[-0.02em]"
        style={{ color: 'var(--mzaya-text-primary)' }}
      >
        {title}
      </h2>

      {message && (
        <p
          className="mx-auto mt-2 max-w-sm text-[12px] leading-6"
          style={{ color: 'var(--mzaya-text-muted)' }}
        >
          {message}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-[14px] px-4 py-2.5 text-[12px] font-semibold text-white outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
          style={{ background: 'var(--mzaya-primary)' }}
        >
          {actionLabel}
        </button>
      )}
    </section>
  )
}
