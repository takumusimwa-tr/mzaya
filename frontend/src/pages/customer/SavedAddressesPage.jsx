/**
 * ============================================================================
 * MZAYA
 * Page: SavedAddressesPage
 * Path: frontend/src/pages/customer/SavedAddressesPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes the customer's saved delivery-address experience using the canonical
 * profile address card.
 *
 * Responsibilities
 * ----------------
 * • Display saved delivery addresses.
 * • Surface default-address state.
 * • Expose add, edit, delete and set-default actions.
 * • Render loading, error and empty states.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not fetch or persist addresses.
 * • Does not validate address forms.
 * • Does not geocode or reverse-geocode.
 * • Does not confirm destructive actions.
 * • Does not navigate directly.
 *
 * Canonical Component Policy
 * --------------------------
 * This page composes:
 *
 *   frontend/src/components/profile/AddressBookCard.jsx
 *
 * Older page-local address cards, default-address badges and address action
 * menus should be retired during the final deduplication pass.
 *
 * Integration Contract
 * --------------------
 * The connected page/container should:
 * 1. Fetch and normalize the authenticated customer's addresses.
 * 2. Confirm destructive actions before calling onDelete.
 * 3. Handle navigation to add/edit address flows.
 * 4. Persist the selected default address.
 *
 * Props
 * -----
 * addresses?: Array<Address>
 * loading?: boolean
 * error?: string | null
 * deletingId?: string | number | null
 * settingDefaultId?: string | number | null
 * onBack?: () => void
 * onRetry?: () => void
 * onAddAddress?: () => void
 * onEditAddress?: (address: Address) => void
 * onDeleteAddress?: (address: Address) => void
 * onSetDefault?: (address: Address) => void
 *
 * Dependencies
 * ------------
 * • AppHeader.jsx
 * • PageShell.jsx
 * • Button.jsx
 * • AddressBookCard.jsx
 * • lucide-react
 *
 * Accessibility
 * -------------
 * • Uses a clear page heading and descriptive empty state.
 * • Announces loading and error state changes.
 * • Keeps all address actions keyboard-accessible.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { MapPin, Plus } from 'lucide-react'
import AppHeader from '../../components/layout/AppHeader'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'
import AddressBookCard from '../../components/profile/AddressBookCard'

function AddressSkeleton() {
  return (
    <div
      className="animate-pulse rounded-[22px] border bg-white p-5"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-hidden="true"
    >
      <div className="flex items-start gap-3">
        <div
          className="h-11 w-11 rounded-[14px]"
          style={{ background: 'var(--mzaya-surface-muted)' }}
        />

        <div className="flex-1">
          <div
            className="h-4 w-28 rounded-full"
            style={{ background: 'var(--mzaya-surface-muted)' }}
          />
          <div
            className="mt-3 h-3 w-4/5 rounded-full"
            style={{ background: 'var(--mzaya-surface-muted)' }}
          />
          <div
            className="mt-2 h-3 w-3/5 rounded-full"
            style={{ background: 'var(--mzaya-surface-muted)' }}
          />
        </div>
      </div>

      <div
        className="mt-5 h-10 w-full rounded-[14px]"
        style={{ background: 'var(--mzaya-surface-muted)' }}
      />
    </div>
  )
}

export default function SavedAddressesPage({
  addresses = [],
  loading = false,
  error = null,
  deletingId = null,
  settingDefaultId = null,
  onBack,
  onRetry,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefault,
}) {
  return (
    <PageShell>
      <AppHeader
        title="Saved addresses"
        subtitle="Manage delivery locations and instructions."
        onBack={onBack}
      />

      <main
        className="mx-auto w-full max-w-3xl px-4 pb-12 pt-4 sm:px-6"
        aria-live="polite"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p
              className="text-[12px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              {addresses.length} saved address
              {addresses.length === 1 ? '' : 'es'}
            </p>
          </div>

          {onAddAddress && (
            <Button leadingIcon={Plus} onClick={onAddAddress}>
              Add address
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4" aria-label="Loading saved addresses">
            <AddressSkeleton />
            <AddressSkeleton />
            <AddressSkeleton />
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
              We could not load your addresses
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
        ) : addresses.length ? (
          <section className="space-y-4" aria-label="Saved delivery addresses">
            {addresses.map((address) => {
              const id = address.id ?? address.address_id
              const deleting = deletingId === id
              const settingDefault = settingDefaultId === id

              return (
                <AddressBookCard
                  key={id ?? `${address.label}-${address.address_line_1}`}
                  address={address}
                  deleting={deleting}
                  settingDefault={settingDefault}
                  onEdit={
                    onEditAddress
                      ? () => onEditAddress(address)
                      : undefined
                  }
                  onDelete={
                    onDeleteAddress
                      ? () => onDeleteAddress(address)
                      : undefined
                  }
                  onSetDefault={
                    onSetDefault
                      ? () => onSetDefault(address)
                      : undefined
                  }
                />
              )
            })}
          </section>
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
              <MapPin aria-hidden="true" size={24} strokeWidth={1.8} />
            </div>

            <h1
              className="mt-5 text-[20px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              No saved addresses
            </h1>

            <p
              className="mx-auto mt-2 max-w-[360px] text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Save your home, work or another delivery location for faster
              checkout.
            </p>

            {onAddAddress && (
              <Button
                leadingIcon={Plus}
                onClick={onAddAddress}
                className="mt-6"
              >
                Add your first address
              </Button>
            )}
          </section>
        )}
      </main>
    </PageShell>
  )
}
