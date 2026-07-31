/**
 * ============================================================================
 * MZAYA
 * Component: VendorApplicationSuccess
 * Path: frontend/src/components/vendor/VendorApplicationSuccess.jsx
 * ----------------------------------------------------------------------------
 * Purpose
 * -------
 * Shared completion state for vendor registration and branch creation.
 *
 * Responsibilities
 * ----------------
 * • Displays a premium confirmation screen and one parent-owned continuation.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not navigate or infer approval timing.
 *
 * Change Log
 * ----------
 * July 2026 — Initial premium vendor implementation.
 * ============================================================================
 */

import { Check, Store } from 'lucide-react'

export default function VendorApplicationSuccess({
  eyebrow = 'Submitted',
  title,
  message,
  actionLabel,
  onAction,
}) {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-5 py-12"
      style={{ background: 'var(--mzaya-background)' }}
    >
      <section
        className="w-full max-w-lg rounded-[30px] border bg-white px-7 py-10 text-center sm:px-10"
        style={{
          borderColor: 'var(--mzaya-border)',
          boxShadow: 'var(--mzaya-shadow-xl)',
        }}
      >
        <div className="relative mx-auto h-16 w-16">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-[22px]"
            style={{
              background: 'var(--mzaya-primary-soft)',
              color: 'var(--mzaya-primary)',
            }}
          >
            <Store size={27} strokeWidth={1.7} aria-hidden="true" />
          </div>
          <span
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white text-white"
            style={{ background: 'var(--mzaya-primary)' }}
          >
            <Check size={13} strokeWidth={2.2} aria-hidden="true" />
          </span>
        </div>

        <p
          className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: 'var(--mzaya-primary)' }}
        >
          {eyebrow}
        </p>
        <h1
          className="mt-2 text-[26px] font-semibold tracking-[-0.04em]"
          style={{ color: 'var(--mzaya-text-primary)' }}
        >
          {title}
        </h1>
        <p
          className="mx-auto mt-3 max-w-sm text-[12px] leading-6"
          style={{ color: 'var(--mzaya-text-muted)' }}
        >
          {message}
        </p>

        <button
          type="button"
          onClick={onAction}
          className="mt-8 w-full rounded-[16px] py-4 text-[12px] font-semibold text-white outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
          style={{ background: 'var(--mzaya-primary)' }}
        >
          {actionLabel}
        </button>
      </section>
    </main>
  )
}
