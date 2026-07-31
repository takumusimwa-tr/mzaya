/**
 * ============================================================================
 * MZAYA
 * Component: AccountDangerZone
 * Path: frontend/src/components/profile/AccountDangerZone.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Isolates irreversible or high-risk account actions from normal profile
 * navigation.
 *
 * Responsibilities
 * ----------------
 * • Clearly explain the impact of account deletion.
 * • Expose a delete-account action supplied by the parent.
 * • Support loading and disabled states.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not delete the account.
 * • Does not perform identity verification.
 * • Does not decide retention or legal-hold policy.
 *
 * Security Note
 * -------------
 * The parent flow should require recent authentication and explicit
 * confirmation before submitting account deletion.
 *
 * Dependencies
 * ------------
 * • Button.jsx
 * • lucide-react
 *
 * Used By
 * -------
 * • SecuritySettingsPage.jsx
 * • AccountSettingsPage.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { TriangleAlert } from 'lucide-react'
import Button from '../ui/Button'

export default function AccountDangerZone({
  onDeleteAccount,
  loading = false,
  disabled = false,
}) {
  return (
    <section
      className="rounded-[22px] border bg-white p-5"
      style={{
        borderColor: 'rgba(192, 57, 43, 0.22)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-labelledby="account-danger-zone-heading"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px]"
          style={{
            background: 'var(--mzaya-error-soft)',
            color: 'var(--mzaya-error)',
          }}
        >
          <TriangleAlert aria-hidden="true" size={19} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <h2
            id="account-danger-zone-heading"
            className="text-[14px] font-semibold"
            style={{ color: 'var(--mzaya-error)' }}
          >
            Delete account
          </h2>

          <p
            className="mt-1 text-[12px] leading-5"
            style={{ color: 'var(--mzaya-text-muted)' }}
          >
            This permanently removes access to your Mzaya account. Some records
            may be retained where required for payments, fraud prevention, or
            legal compliance.
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={onDeleteAccount}
        loading={loading}
        disabled={disabled}
        className="mt-4 w-full"
        style={{
          color: 'var(--mzaya-error)',
          borderColor: 'rgba(192, 57, 43, 0.28)',
        }}
      >
        Delete my account
      </Button>
    </section>
  )
}
