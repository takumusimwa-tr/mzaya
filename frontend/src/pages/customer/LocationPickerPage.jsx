/**
 * ============================================================================
 * MZAYA
 * Page: LocationPickerPage
 * Path: frontend/src/pages/customer/LocationPickerPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes customer delivery-location selection.
 *
 * Responsibilities
 * ----------------
 * • Display saved addresses, current-location action and location search.
 * • Forward search, selection and add-address actions.
 * • Render loading, error and empty states.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not request device location permission.
 * • Does not geocode or reverse-geocode.
 * • Does not validate service coverage.
 * • Does not persist the selected location.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import {
  ArrowLeft,
  Crosshair,
  MapPin,
  Plus,
  Search,
} from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'
import AddressBookCard from '../../components/profile/AddressBookCard'

export default function LocationPickerPage({
  query = '',
  savedAddresses = [],
  searchResults = [],
  selectedAddressId = null,
  loading = false,
  locating = false,
  error = null,
  onBack,
  onRetry,
  onQueryChange,
  onSearch,
  onUseCurrentLocation,
  onSelectAddress,
  onAddAddress,
}) {
  const showSearchResults = query.trim().length > 0

  return (
    <PageShell>
      <main
        className="mx-auto w-full max-w-4xl px-4 pb-12 pt-4 sm:px-6"
        aria-live="polite"
      >
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-[15px] border bg-white outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{
              borderColor: 'var(--mzaya-border)',
              color: 'var(--mzaya-text-primary)',
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={19} strokeWidth={1.8} />
          </button>
          <div>
            <h1
              className="text-[24px] font-semibold tracking-[-0.035em]"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              Choose location
            </h1>
            <p
              className="mt-1 text-[12px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Select where your mzaya should deliver.
            </p>
          </div>
        </header>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSearch?.(query)
          }}
          className="relative mt-6"
          role="search"
        >
          <Search
            aria-hidden="true"
            size={18}
            strokeWidth={1.8}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--mzaya-text-muted)' }}
          />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange?.(event.target.value)}
            placeholder="Search suburb, street or landmark"
            className="h-12 w-full rounded-[17px] border bg-white pl-12 pr-4 text-[13px] outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{
              borderColor: 'var(--mzaya-border)',
              color: 'var(--mzaya-text-primary)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          />
        </form>

        {onUseCurrentLocation && (
          <Button
            variant="outline"
            leadingIcon={Crosshair}
            loading={locating}
            onClick={onUseCurrentLocation}
            className="mt-4 w-full"
          >
            Use current location
          </Button>
        )}

        {loading ? (
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[20px] border"
                style={{
                  minHeight: 120,
                  borderColor: 'var(--mzaya-border)',
                  background: 'var(--mzaya-surface)',
                }}
                aria-hidden="true"
              />
            ))}
          </div>
        ) : error ? (
          <section
            className="mt-6 rounded-[24px] border bg-white px-6 py-12 text-center"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          >
            <h2
              className="text-[20px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              We could not load locations
            </h2>
            <p
              className="mx-auto mt-2 max-w-[380px] text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              {error}
            </p>
            {onRetry && (
              <Button onClick={onRetry} className="mt-6">
                Try again
              </Button>
            )}
          </section>
        ) : showSearchResults ? (
          <section className="mt-6" aria-labelledby="location-results-heading">
            <h2
              id="location-results-heading"
              className="mb-3 text-[16px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              Search results
            </h2>

            {searchResults.length ? (
              <div
                className="overflow-hidden rounded-[20px] border bg-white"
                style={{
                  borderColor: 'var(--mzaya-border)',
                  boxShadow: 'var(--mzaya-shadow-sm)',
                }}
              >
                {searchResults.map((result, index) => (
                  <button
                    key={result.id ?? `${result.label}-${index}`}
                    type="button"
                    onClick={() => onSelectAddress?.(result)}
                    className={`flex w-full items-start gap-3 px-4 py-4 text-left outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)] ${
                      index ? 'border-t' : ''
                    }`}
                    style={{ borderColor: 'var(--mzaya-border)' }}
                  >
                    <MapPin
                      size={17}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      style={{ color: 'var(--mzaya-primary)' }}
                    />
                    <div>
                      <p
                        className="text-[13px] font-semibold"
                        style={{ color: 'var(--mzaya-text-primary)' }}
                      >
                        {result.label ?? result.name}
                      </p>
                      {result.address && (
                        <p
                          className="mt-1 text-[11px] leading-5"
                          style={{ color: 'var(--mzaya-text-muted)' }}
                        >
                          {result.address}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p
                className="rounded-[20px] border bg-white px-6 py-10 text-center text-[13px]"
                style={{
                  borderColor: 'var(--mzaya-border)',
                  color: 'var(--mzaya-text-muted)',
                }}
              >
                No matching locations found.
              </p>
            )}
          </section>
        ) : (
          <section className="mt-6" aria-labelledby="saved-locations-heading">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2
                id="saved-locations-heading"
                className="text-[16px] font-semibold"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                Saved addresses
              </h2>

              {onAddAddress && (
                <Button
                  variant="outline"
                  leadingIcon={Plus}
                  onClick={onAddAddress}
                >
                  Add address
                </Button>
              )}
            </div>

            {savedAddresses.length ? (
              <div className="space-y-3">
                {savedAddresses.map((address) => {
                  const id = address.id ?? address.address_id ?? address.addressId
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onSelectAddress?.(address)}
                      className="block w-full rounded-[22px] text-left outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                      aria-pressed={selectedAddressId === id}
                    >
                      <div
                        className="rounded-[22px]"
                        style={{
                          outline:
                            selectedAddressId === id
                              ? '2px solid var(--mzaya-primary)'
                              : '2px solid transparent',
                          outlineOffset: 2,
                        }}
                      >
                        <AddressBookCard address={address} selectable />
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <section
                className="rounded-[22px] border bg-white px-6 py-12 text-center"
                style={{
                  borderColor: 'var(--mzaya-border)',
                  boxShadow: 'var(--mzaya-shadow-sm)',
                }}
              >
                <MapPin
                  className="mx-auto"
                  size={25}
                  strokeWidth={1.8}
                  style={{ color: 'var(--mzaya-primary)' }}
                  aria-hidden="true"
                />
                <h3
                  className="mt-4 text-[19px] font-semibold"
                  style={{ color: 'var(--mzaya-text-primary)' }}
                >
                  No saved addresses
                </h3>
                <p
                  className="mx-auto mt-2 max-w-sm text-[13px] leading-6"
                  style={{ color: 'var(--mzaya-text-muted)' }}
                >
                  Add an address to make future deliveries faster.
                </p>
              </section>
            )}
          </section>
        )}
      </main>
    </PageShell>
  )
}
