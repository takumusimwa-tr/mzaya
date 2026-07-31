/**
 * ============================================================================
 * MZAYA
 * Page: ProfilePage
 * Path: frontend/src/pages/customer/ProfilePage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes the customer's account overview using the canonical reusable profile
 * components.
 *
 * Responsibilities
 * ----------------
 * • Display customer identity and approved account details.
 * • Group account, preferences, support and legal destinations.
 * • Surface sign-out as a separate, deliberate action.
 * • Forward all navigation and account actions to the application layer.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not fetch or update customer data.
 * • Does not upload profile images.
 * • Does not navigate directly.
 * • Does not terminate sessions.
 * • Does not expose authentication tokens or sensitive payment information.
 *
 * Canonical Component Policy
 * --------------------------
 * This page composes the canonical profile components under:
 *
 *   frontend/src/components/profile/
 *
 * Older page-local menu rows, identity cards, sign-out panels and account
 * sections should be retired during the final deduplication pass.
 *
 * Integration Contract
 * --------------------
 * The connected page/container should:
 * 1. Fetch and normalize the authenticated customer profile.
 * 2. Supply only display-approved customer data.
 * 3. Resolve navigation for each onOpen* callback.
 * 4. Handle profile editing and sign-out securely.
 *
 * Props
 * -----
 * customer?: Object
 * loading?: boolean
 * error?: string | null
 * signingOut?: boolean
 * onRetry?: () => void
 * onBack?: () => void
 * onEditProfile?: (customer: Object) => void
 * onOpenAddresses?: () => void
 * onOpenPaymentMethods?: () => void
 * onOpenNotifications?: () => void
 * onOpenSecurity?: () => void
 * onOpenHelp?: () => void
 * onOpenLegal?: () => void
 * onOpenAbout?: () => void
 * onSignOut?: () => void
 *
 * Dependencies
 * ------------
 * • AppHeader.jsx
 * • PageShell.jsx
 * • Button.jsx
 * • ProfileHeaderCard.jsx
 * • ProfileMenuItem.jsx
 * • ProfileMenuSection.jsx
 * • SignOutCard.jsx
 * • lucide-react
 *
 * Accessibility
 * -------------
 * • Maintains a visible page title.
 * • Uses buttons for interactive destinations.
 * • Announces loading and error state changes.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import {
  Bell,
  Building2,
  CircleHelp,
  CreditCard,
  FileText,
  Info,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import AppHeader from '../../components/layout/AppHeader'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'
import ProfileHeaderCard from '../../components/profile/ProfileHeaderCard'
import ProfileMenuItem from '../../components/profile/ProfileMenuItem'
import ProfileMenuSection from '../../components/profile/ProfileMenuSection'
import SignOutCard from '../../components/profile/SignOutCard'

function ProfileSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading profile">
      <div
        className="animate-pulse rounded-[24px] border bg-white p-5"
        style={{
          minHeight: 150,
          borderColor: 'var(--mzaya-border)',
          boxShadow: 'var(--mzaya-shadow-sm)',
        }}
        aria-hidden="true"
      >
        <div className="flex items-center gap-4">
          <div
            className="h-16 w-16 rounded-full"
            style={{ background: 'var(--mzaya-surface-muted)' }}
          />
          <div className="flex-1">
            <div
              className="h-4 w-40 rounded-full"
              style={{ background: 'var(--mzaya-surface-muted)' }}
            />
            <div
              className="mt-3 h-3 w-52 rounded-full"
              style={{ background: 'var(--mzaya-surface-muted)' }}
            />
          </div>
        </div>
      </div>

      {[260, 220, 170].map((height, index) => (
        <div
          key={`${height}-${index}`}
          className="animate-pulse rounded-[22px] border bg-white p-5"
          style={{
            minHeight: height,
            borderColor: 'var(--mzaya-border)',
            boxShadow: 'var(--mzaya-shadow-sm)',
          }}
          aria-hidden="true"
        >
          <div
            className="h-4 w-28 rounded-full"
            style={{ background: 'var(--mzaya-surface-muted)' }}
          />
          <div
            className="mt-5 h-12 w-full rounded-[16px]"
            style={{ background: 'var(--mzaya-surface-muted)' }}
          />
          <div
            className="mt-3 h-12 w-full rounded-[16px]"
            style={{ background: 'var(--mzaya-surface-muted)' }}
          />
        </div>
      ))}
    </div>
  )
}

export default function ProfilePage({
  customer,
  loading = false,
  error = null,
  signingOut = false,
  onRetry,
  onBack,
  onEditProfile,
  onOpenAddresses,
  onOpenPaymentMethods,
  onOpenNotifications,
  onOpenSecurity,
  onOpenHelp,
  onOpenLegal,
  onOpenAbout,
  onSignOut,
}) {
  return (
    <PageShell>
      <AppHeader
        title="Profile"
        subtitle="Manage your Mzaya account and preferences."
        onBack={onBack}
      />

      <main
        className="mx-auto w-full max-w-3xl px-4 pb-12 pt-4 sm:px-6"
        aria-live="polite"
      >
        {loading ? (
          <ProfileSkeleton />
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
              We could not load your profile
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
        ) : !customer ? (
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
              Profile unavailable
            </h1>

            <p
              className="mx-auto mt-2 max-w-[360px] text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Your account details are not available right now.
            </p>
          </section>
        ) : (
          <div className="space-y-4">
            <ProfileHeaderCard
              customer={customer}
              accountLabel={customer.account_label ?? customer.account_type}
              onEdit={
                onEditProfile ? () => onEditProfile(customer) : undefined
              }
            />

            <ProfileMenuSection title="Account">
              <ProfileMenuItem
                icon={MapPin}
                label="Saved addresses"
                description="Manage delivery locations and instructions."
                onClick={onOpenAddresses}
              />

              <ProfileMenuItem
                icon={CreditCard}
                label="Payment methods"
                description="Review your saved payment options."
                onClick={onOpenPaymentMethods}
              />

              <ProfileMenuItem
                icon={ShieldCheck}
                label="Security"
                description="Password, verification and session controls."
                onClick={onOpenSecurity}
              />
            </ProfileMenuSection>

            <ProfileMenuSection title="Preferences">
              <ProfileMenuItem
                icon={Bell}
                label="Notifications"
                description="Choose how Mzaya keeps you informed."
                onClick={onOpenNotifications}
              />
            </ProfileMenuSection>

            <ProfileMenuSection title="Support">
              <ProfileMenuItem
                icon={CircleHelp}
                label="Help center"
                description="Orders, payments, account help and support."
                onClick={onOpenHelp}
              />
            </ProfileMenuSection>

            <ProfileMenuSection title="Mzaya">
              <ProfileMenuItem
                icon={FileText}
                label="Legal and policies"
                description="Terms, privacy and platform policies."
                onClick={onOpenLegal}
              />

              <ProfileMenuItem
                icon={Info}
                label="About Mzaya"
                description="Platform information and app details."
                onClick={onOpenAbout}
              />

              {customer.business_name && (
                <ProfileMenuItem
                  icon={Building2}
                  label="Business account"
                  description={customer.business_name}
                  trailingValue="Connected"
                  disabled
                />
              )}
            </ProfileMenuSection>

            <SignOutCard
              loading={signingOut}
              onSignOut={onSignOut}
            />
          </div>
        )}
      </main>
    </PageShell>
  )
}
