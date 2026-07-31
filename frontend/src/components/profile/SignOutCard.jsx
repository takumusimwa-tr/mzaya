/**
 * ============================================================================
 * MZAYA
 * Component: SignOutCard
 * Path: frontend/src/components/profile/SignOutCard.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Provides a clear, isolated sign-out action at the end of the profile page.
 *
 * Responsibilities
 * ----------------
 * • Present sign-out as a deliberate account action.
 * • Support a loading state while session termination is in progress.
 * • Keep sign-out visually distinct from navigation rows.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not clear tokens or application state directly.
 * • Does not revoke sessions.
 * • Does not navigate after sign-out.
 *
 * Dependencies
 * ------------
 * • Button.jsx
 * • lucide-react
 *
 * Used By
 * -------
 * • ProfilePage.jsx
 *
 * Security Note
 * -------------
 * Session termination must be handled by the authentication service. The parent
 * page should clear sensitive cached state only after the sign-out request has
 * been handled according to the app's auth strategy.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { LogOut } from 'lucide-react'
import Button from '../ui/Button'

export default function SignOutCard({
  onSignOut,
  loading = false,
}) {
  return (
    <section
      className="rounded-[22px] border bg-white p-4"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
    >
      <Button
        variant="outline"
        leadingIcon={LogOut}
        onClick={onSignOut}
        loading={loading}
        className="w-full"
        style={{
          color: 'var(--mzaya-error)',
          borderColor: 'rgba(192, 57, 43, 0.24)',
        }}
      >
        Sign out
      </Button>
    </section>
  )
}
