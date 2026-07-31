/**
 * ============================================================================
 * MZAYA
 * Page: NotificationSettingsPage
 * Path: frontend/src/pages/customer/NotificationSettingsPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes customer notification preferences from canonical reusable profile
 * components.
 *
 * Responsibilities
 * ----------------
 * • Display grouped notification preferences.
 * • Forward preference changes to the application layer.
 * • Render loading, saving, error and unavailable states.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not persist preferences.
 * • Does not request operating-system notification permission.
 * • Does not subscribe to push services.
 *
 * Canonical Component Policy
 * --------------------------
 * Uses:
 *   frontend/src/components/profile/NotificationPreferenceRow.jsx
 *
 * Integration Contract
 * --------------------
 * Supply normalized preference objects with:
 *   id, label, description, enabled, disabled
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { Bell } from 'lucide-react'
import AppHeader from '../../components/layout/AppHeader'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'
import NotificationPreferenceRow from '../../components/profile/NotificationPreferenceRow'

function PreferenceSkeleton() {
  return (
    <div
      className="animate-pulse rounded-[22px] border bg-white p-5"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-hidden="true"
    >
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex items-center justify-between gap-4 border-b py-4 last:border-b-0"
          style={{ borderColor: 'var(--mzaya-border)' }}
        >
          <div className="flex-1">
            <div
              className="h-4 w-36 rounded-full"
              style={{ background: 'var(--mzaya-surface-muted)' }}
            />
            <div
              className="mt-2 h-3 w-56 rounded-full"
              style={{ background: 'var(--mzaya-surface-muted)' }}
            />
          </div>
          <div
            className="h-7 w-12 rounded-full"
            style={{ background: 'var(--mzaya-surface-muted)' }}
          />
        </div>
      ))}
    </div>
  )
}

export default function NotificationSettingsPage({
  sections = [],
  loading = false,
  error = null,
  savingIds = [],
  onBack,
  onRetry,
  onChange,
}) {
  const hasPreferences = sections.some(
    (section) => Array.isArray(section.preferences) && section.preferences.length
  )

  return (
    <PageShell>
      <AppHeader
        title="Notifications"
        subtitle="Choose how Mzaya keeps you informed."
        onBack={onBack}
      />

      <main
        className="mx-auto w-full max-w-3xl px-4 pb-12 pt-4 sm:px-6"
        aria-live="polite"
      >
        {loading ? (
          <div className="space-y-4" aria-label="Loading notification settings">
            <PreferenceSkeleton />
            <PreferenceSkeleton />
          </div>
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
              We could not load notification settings
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
        ) : hasPreferences ? (
          <div className="space-y-5">
            {sections.map((section) => (
              <section key={section.id ?? section.title}>
                <div className="mb-2 px-1">
                  <h2
                    className="text-[13px] font-semibold"
                    style={{ color: 'var(--mzaya-text-primary)' }}
                  >
                    {section.title}
                  </h2>
                  {section.description && (
                    <p
                      className="mt-1 text-[11px] leading-5"
                      style={{ color: 'var(--mzaya-text-muted)' }}
                    >
                      {section.description}
                    </p>
                  )}
                </div>

                <div
                  className="overflow-hidden rounded-[22px] border bg-white"
                  style={{
                    borderColor: 'var(--mzaya-border)',
                    boxShadow: 'var(--mzaya-shadow-sm)',
                  }}
                >
                  {section.preferences?.map((preference, index) => (
                    <div
                      key={preference.id}
                      className={index ? 'border-t' : ''}
                      style={{ borderColor: 'var(--mzaya-border)' }}
                    >
                      <NotificationPreferenceRow
                        label={preference.label}
                        description={preference.description}
                        checked={Boolean(preference.enabled)}
                        disabled={
                          Boolean(preference.disabled) ||
                          savingIds.includes(preference.id)
                        }
                        onChange={(enabled) =>
                          onChange?.(preference, enabled)
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <section
            className="rounded-[24px] border bg-white px-6 py-12 text-center"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          >
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px]"
              style={{
                background: 'var(--mzaya-primary-soft)',
                color: 'var(--mzaya-primary)',
              }}
            >
              <Bell aria-hidden="true" size={24} strokeWidth={1.8} />
            </div>
            <h1
              className="mt-5 text-[20px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              No notification settings
            </h1>
            <p
              className="mx-auto mt-2 max-w-[360px] text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Notification preferences are not available for this account yet.
            </p>
          </section>
        )}
      </main>
    </PageShell>
  )
}
