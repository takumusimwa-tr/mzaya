/**
 * ============================================================================
 * MZAYA
 * Component: SecuritySettingCard
 * Path: frontend/src/components/profile/SecuritySettingCard.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Presents one account-security control inside the customer settings area.
 *
 * Responsibilities
 * ----------------
 * • Display the security feature name and current state.
 * • Expose one parent-controlled action.
 * • Support positive, neutral and warning status text.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not change passwords, PINs or authentication factors.
 * • Does not verify identity.
 * • Does not store or display secrets.
 *
 * Security Note
 * -------------
 * Never pass passwords, reset tokens, OTP values, recovery codes or raw session
 * identifiers into this component.
 *
 * Dependencies
 * ------------
 * • Button.jsx
 * • lucide-react
 *
 * Used By
 * -------
 * • SecuritySettingsPage.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial production candidate.
 * ============================================================================
 */

import { ShieldCheck } from 'lucide-react'
import Button from '../ui/Button'

const TONE_MAP = {
  success: 'var(--mzaya-success)',
  warning: 'var(--mzaya-warning)',
  neutral: 'var(--mzaya-text-muted)',
}

export default function SecuritySettingCard({
  title,
  description,
  status,
  statusTone = 'neutral',
  actionLabel,
  onAction,
  loading = false,
  disabled = false,
  icon: Icon = ShieldCheck,
}) {
  return (
    <section
      className="rounded-[22px] border bg-white p-5"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-labelledby={`security-${title?.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px]"
          style={{
            background: 'var(--mzaya-surface-muted)',
            color: 'var(--mzaya-text-secondary)',
          }}
        >
          <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <h2
            id={`security-${title?.toLowerCase().replace(/\s+/g, '-')}`}
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

          {status && (
            <p
              className="mt-2 text-[11px] font-semibold"
              style={{ color: TONE_MAP[statusTone] || TONE_MAP.neutral }}
            >
              {status}
            </p>
          )}
        </div>
      </div>

      {actionLabel && onAction && (
        <Button
          variant="outline"
          onClick={onAction}
          loading={loading}
          disabled={disabled}
          className="mt-4 w-full"
        >
          {actionLabel}
        </Button>
      )}
    </section>
  )
}
