/**
 * ============================================================================
 * MZAYA
 * Component: SupportTopicCard
 * Path: frontend/src/components/profile/SupportTopicCard.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Represents one customer-support topic in the help center.
 *
 * Responsibilities
 * ----------------
 * • Display a topic title, explanation and optional icon.
 * • Expose a parent-controlled selection action.
 * • Support optional article-count metadata.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not navigate directly.
 * • Does not search support articles.
 * • Does not create support tickets.
 *
 * Dependencies
 * ------------
 * • lucide-react
 *
 * Used By
 * -------
 * • HelpCenterPage.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { ChevronRight, CircleHelp } from 'lucide-react'

export default function SupportTopicCard({
  title,
  description,
  articleCount,
  icon: Icon = CircleHelp,
  onSelect,
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-[20px] border bg-white p-4 text-left outline-none transition-transform active:scale-[0.99] focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-xs)',
      }}
    >
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px]"
        style={{
          background: 'var(--mzaya-primary-soft)',
          color: 'var(--mzaya-primary)',
        }}
      >
        <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <h2
          className="text-[14px] font-semibold"
          style={{ color: 'var(--mzaya-text-primary)' }}
        >
          {title}
        </h2>

        {description && (
          <p
            className="mt-1 text-[12px] leading-5"
            style={{ color: 'var(--mzaya-text-muted)' }}
          >
            {description}
          </p>
        )}

        {typeof articleCount === 'number' && (
          <p
            className="mt-2 text-[11px]"
            style={{ color: 'var(--mzaya-text-muted)' }}
          >
            {articleCount} article{articleCount === 1 ? '' : 's'}
          </p>
        )}
      </div>

      <ChevronRight
        aria-hidden="true"
        size={17}
        strokeWidth={1.8}
        style={{ color: 'var(--mzaya-text-muted)' }}
      />
    </button>
  )
}
