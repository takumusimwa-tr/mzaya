/**
 * ============================================================================
 * MZAYA
 * Component: LegalDocumentRow
 * Path: frontend/src/components/profile/LegalDocumentRow.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Represents one legal, policy or compliance document inside account settings.
 *
 * Responsibilities
 * ----------------
 * • Display the document name and optional update date.
 * • Expose a parent-controlled open action.
 * • Support external-document disclosure text.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not fetch or render legal content.
 * • Does not determine whether consent is required.
 * • Does not track document acceptance.
 *
 * Used By
 * -------
 * • LegalPage.jsx
 * • ProfilePage.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { ChevronRight, FileText } from 'lucide-react'

export default function LegalDocumentRow({
  title,
  updatedAt,
  description,
  onOpen,
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 px-4 py-4 text-left outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px]"
        style={{
          background: 'var(--mzaya-surface-muted)',
          color: 'var(--mzaya-text-secondary)',
        }}
      >
        <FileText aria-hidden="true" size={18} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <h2
          className="text-[14px] font-medium"
          style={{ color: 'var(--mzaya-text-primary)' }}
        >
          {title}
        </h2>

        {(description || updatedAt) && (
          <p
            className="mt-1 text-[11px] leading-5"
            style={{ color: 'var(--mzaya-text-muted)' }}
          >
            {description}
            {description && updatedAt ? ' · ' : ''}
            {updatedAt ? `Updated ${updatedAt}` : ''}
          </p>
        )}
      </div>

      <ChevronRight
        aria-hidden="true"
        size={16}
        strokeWidth={1.8}
        style={{ color: 'var(--mzaya-text-muted)' }}
      />
    </button>
  )
}
