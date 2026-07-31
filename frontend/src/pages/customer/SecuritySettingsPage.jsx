/**
 * ============================================================================
 * MZAYA
 * Page: SecuritySettingsPage
 * Path: frontend/src/pages/customer/SecuritySettingsPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes customer-facing account security controls.
 *
 * Responsibilities
 * ----------------
 * • Display password, verification, PIN and session controls.
 * • Surface security status and warnings.
 * • Forward all security actions to secure application workflows.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not accept passwords, OTPs, recovery codes or authentication secrets.
 * • Does not terminate sessions directly.
 * • Does not determine authentication policy.
 *
 * Canonical Component Policy
 * --------------------------
 * Uses:
 *   frontend/src/components/profile/SecuritySettingCard.jsx
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import {
  KeyRound,
  LockKeyhole,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import AppHeader from '../../components/layout/AppHeader'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'
import SecuritySettingCard from '../../components/profile/SecuritySettingCard'

const ICONS = {
  password: KeyRound,
  verification: Smartphone,
  pin: LockKeyhole,
  sessions: MonitorSmartphone,
  default: ShieldCheck,
}

function SecuritySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-label="Loading security settings">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-[22px] border bg-white p-5"
          style={{
            minHeight: 170,
            borderColor: 'var(--mzaya-border)',
            boxShadow: 'var(--mzaya-shadow-sm)',
          }}
          aria-hidden="true"
        >
          <div
            className="h-11 w-11 rounded-[14px]"
            style={{ background: 'var(--mzaya-surface-muted)' }}
          />
          <div
            className="mt-4 h-4 w-36 rounded-full"
            style={{ background: 'var(--mzaya-surface-muted)' }}
          />
          <div
            className="mt-3 h-3 w-full rounded-full"
            style={{ background: 'var(--mzaya-surface-muted)' }}
          />
        </div>
      ))}
    </div>
  )
}

export default function SecuritySettingsPage({
  settings = [],
  loading = false,
  error = null,
  activeActionId = null,
  onBack,
  onRetry,
  onAction,
}) {
  return (
    <PageShell>
      <AppHeader
        title="Security"
        subtitle="Protect your Mzaya account."
        onBack={onBack}
      />

      <main
        className="mx-auto w-full max-w-4xl px-4 pb-12 pt-4 sm:px-6"
        aria-live="polite"
      >
        <section
          className="mb-5 rounded-[22px] border p-5"
          style={{
            borderColor: 'var(--mzaya-border)',
            background: 'var(--mzaya-primary-soft)',
          }}
        >
          <div className="flex gap-3">
            <ShieldCheck
              aria-hidden="true"
              size={21}
              strokeWidth={1.8}
              style={{ color: 'var(--mzaya-primary)' }}
            />
            <div>
              <h2
                className="text-[14px] font-semibold"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                Keep your account secure
              </h2>
              <p
                className="mt-1 text-[12px] leading-5"
                style={{ color: 'var(--mzaya-text-secondary)' }}
              >
                Mzaya will never ask you to share your password, PIN, OTP or
                recovery codes with a mzaya or merchant.
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <SecuritySkeleton />
        ) : error ? (
          <section
            className="rounded-[24px] border bg-white px-6 py-12 text-center"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          >
            <h1
              className="text-[20px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              We could not load security settings
            </h1>
            <p
              className="mx-auto mt-2 max-w-[380px] text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              {error}
            </p>
            {onRetry && (
              <Button onClick={onRetry} className="mt-6 min-w-[140px]">
                Try again
              </Button>
            )}
          </section>
        ) : settings.length ? (
          <section
            className="grid gap-4 sm:grid-cols-2"
            aria-label="Account security settings"
          >
            {settings.map((setting) => (
              <SecuritySettingCard
                key={setting.id}
                title={setting.title}
                description={setting.description}
                status={setting.status}
                statusTone={setting.statusTone}
                actionLabel={setting.actionLabel}
                loading={activeActionId === setting.id}
                disabled={Boolean(setting.disabled)}
                icon={ICONS[setting.type] ?? ICONS.default}
                onAction={
                  onAction ? () => onAction(setting) : undefined
                }
              />
            ))}
          </section>
        ) : (
          <section
            className="rounded-[24px] border bg-white px-6 py-12 text-center"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          >
            <h1
              className="text-[20px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              Security settings unavailable
            </h1>
            <p
              className="mx-auto mt-2 max-w-[360px] text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Account security controls are not available right now.
            </p>
          </section>
        )}
      </main>
    </PageShell>
  )
}
