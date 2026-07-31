/**
 * ============================================================================
 * MZAYA
 * Component: ProfileHeaderCard
 * Path: frontend/src/components/profile/ProfileHeaderCard.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Presents the customer's core identity and account summary at the top of the
 * profile page.
 *
 * Responsibilities
 * ----------------
 * • Display customer name, contact detail and optional profile image.
 * • Show a compact account status or membership label.
 * • Expose an edit action supplied by the parent page.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not upload profile images.
 * • Does not edit personal information.
 * • Does not fetch account data.
 *
 * Data Contract
 * -------------
 * user?: {
 *   first_name?: string,
 *   last_name?: string,
 *   full_name?: string,
 *   email?: string,
 *   phone?: string,
 *   avatar_url?: string,
 *   account_label?: string
 * }
 *
 * Dependencies
 * ------------
 * • imageUrl()
 * • lucide-react
 *
 * Used By
 * -------
 * • ProfilePage.jsx
 *
 * Privacy Note
 * ------------
 * Only render account information that is already approved for display. Avoid
 * exposing internal identifiers, verification payloads or security metadata.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { Pencil, UserRound } from 'lucide-react'
import imageUrl from '../../utils/imageUrl'

function getDisplayName(user) {
  if (!user) return 'Mzaya customer'
  if (user.full_name) return user.full_name

  const name = [user.first_name, user.last_name].filter(Boolean).join(' ')
  return name || 'Mzaya customer'
}

export default function ProfileHeaderCard({
  user,
  onEdit,
}) {
  const displayName = getDisplayName(user)
  const contact = user?.phone || user?.email

  return (
    <section
      className="rounded-[24px] border bg-white p-5"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-labelledby="profile-header-heading"
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
          style={{
            background: 'var(--mzaya-primary-soft)',
            color: 'var(--mzaya-primary)',
          }}
        >
          {user?.avatar_url ? (
            <img
              src={imageUrl(user.avatar_url, 180)}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound aria-hidden="true" size={26} strokeWidth={1.7} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1
            id="profile-header-heading"
            className="truncate text-[21px] font-semibold tracking-[-0.03em]"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            {displayName}
          </h1>

          {contact && (
            <p
              className="mt-1 truncate text-[13px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              {contact}
            </p>
          )}

          {user?.account_label && (
            <span
              className="mt-3 inline-flex min-h-7 items-center rounded-full px-3 text-[11px] font-semibold"
              style={{
                background: 'var(--mzaya-primary-soft)',
                color: 'var(--mzaya-primary)',
              }}
            >
              {user.account_label}
            </span>
          )}
        </div>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit profile"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border bg-white outline-none transition-transform active:scale-95 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{
              borderColor: 'var(--mzaya-border)',
              color: 'var(--mzaya-text-secondary)',
            }}
          >
            <Pencil aria-hidden="true" size={17} strokeWidth={1.8} />
          </button>
        )}
      </div>
    </section>
  )
}
