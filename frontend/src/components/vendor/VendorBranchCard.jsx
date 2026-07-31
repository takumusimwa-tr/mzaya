/**
 * ============================================================================
 * MZAYA
 * Component: VendorBranchCard
 * Path: frontend/src/components/vendor/VendorBranchCard.jsx
 * ----------------------------------------------------------------------------
 * Purpose
 * -------
 * Presents the branch-management entry point inside vendor settings.
 *
 * Responsibilities
 * ----------------
 * • Explains multi-location support.
 * • Forwards the add-branch action to the page.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not list, fetch, select or create branches.
 *
 * Change Log
 * ----------
 * July 2026 — Initial premium vendor implementation.
 * ============================================================================
 */

import { ArrowRight, Store } from 'lucide-react'

export default function VendorBranchCard({ onAddBranch }) {
  return (
    <section
      className="rounded-[24px] border p-5 sm:p-6"
      style={{
        borderColor: 'var(--mzaya-border)',
        background:
          'linear-gradient(135deg, var(--mzaya-primary-soft), var(--mzaya-surface))',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-labelledby="vendor-branches-heading"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px]"
            style={{
              background: 'var(--mzaya-surface)',
              color: 'var(--mzaya-primary)',
            }}
          >
            <Store size={20} strokeWidth={1.8} aria-hidden="true" />
          </div>
          <div>
            <h2
              id="vendor-branches-heading"
              className="text-[15px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              Grow to another location
            </h2>
            <p
              className="mt-1 max-w-xl text-[11px] leading-5"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Add a branch under this brand. New locations remain pending until approved.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddBranch}
          className="inline-flex items-center justify-center gap-2 rounded-[14px] px-4 py-3 text-[11px] font-semibold text-white outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
          style={{ background: 'var(--mzaya-primary)' }}
        >
          Add branch
          <ArrowRight size={14} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
