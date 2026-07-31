/**
 * ============================================================================
 * MZAYA
 * Component: ProfileMenuSection
 * Path: frontend/src/components/profile/ProfileMenuSection.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Groups related profile actions into a premium, reusable account section.
 *
 * Responsibilities
 * ----------------
 * • Render an optional section title.
 * • Render ProfileMenuItem for each supplied item.
 * • Apply consistent separators and card treatment.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not decide which actions belong together.
 * • Does not navigate or mutate state.
 * • Does not enforce account permissions.
 *
 * Data Contract
 * -------------
 * items: Array<ProfileMenuItem props>
 *
 * Dependencies
 * ------------
 * • ProfileMenuItem.jsx
 *
 * Used By
 * -------
 * • ProfilePage.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import ProfileMenuItem from './ProfileMenuItem'

export default function ProfileMenuSection({
  title,
  items = [],
}) {
  if (!items.length) return null

  return (
    <section>
      {title && (
        <h2
          className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: 'var(--mzaya-text-muted)' }}
        >
          {title}
        </h2>
      )}

      <div
        className="overflow-hidden rounded-[22px] border bg-white divide-y"
        style={{
          borderColor: 'var(--mzaya-border)',
          boxShadow: 'var(--mzaya-shadow-sm)',
        }}
      >
        {items.map((item) => (
          <ProfileMenuItem key={item.id ?? item.label} {...item} />
        ))}
      </div>
    </section>
  )
}
