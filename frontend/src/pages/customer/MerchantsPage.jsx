/**
 * ============================================================================
 * MZAYA
 * Page: MerchantsPage
 * Path: frontend/src/pages/customer/MerchantsPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes a browsable merchant directory for the customer application.
 *
 * Responsibilities
 * ----------------
 * • Display merchant categories, filters and merchant cards.
 * • Forward search, filter and merchant-selection actions.
 * • Render loading, empty and error states.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not fetch merchants.
 * • Does not rank, personalize or filter data internally.
 * • Does not calculate ratings, ETA, fees or distance.
 * • Does not navigate directly.
 *
 * Integration Contract
 * --------------------
 * The parent/container must supply the final merchant list and own all filtering,
 * searching and routing behavior.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { ArrowLeft, Clock3, Search, Store } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'

export default function MerchantsPage({
  title = 'Explore merchants',
  subtitle = 'Browse trusted businesses available on Mzaya.',
  query = '',
  filters = [],
  activeFilter = 'all',
  merchants = [],
  loading = false,
  error = null,
  onBack,
  onQueryChange,
  onSearch,
  onFilterChange,
  onOpenMerchant,
  onRetry,
}) {
  return (
    <PageShell>
      <main
        className="mx-auto w-full max-w-6xl px-4 pb-12 pt-4 sm:px-6"
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
              {title}
            </h1>
            <p
              className="mt-1 text-[12px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              {subtitle}
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
            placeholder="Search merchants"
            className="h-12 w-full rounded-[17px] border bg-white pl-12 pr-4 text-[13px] outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{
              borderColor: 'var(--mzaya-border)',
              color: 'var(--mzaya-text-primary)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          />
        </form>

        {filters.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => {
              const active = activeFilter === filter.id
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => onFilterChange?.(filter)}
                  className="whitespace-nowrap rounded-full border px-4 py-2 text-[12px] font-medium outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                  style={{
                    borderColor: active
                      ? 'var(--mzaya-primary)'
                      : 'var(--mzaya-border)',
                    background: active
                      ? 'var(--mzaya-primary)'
                      : 'var(--mzaya-surface)',
                    color: active ? 'white' : 'var(--mzaya-text-secondary)',
                  }}
                  aria-pressed={active}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[22px] border"
                style={{
                  minHeight: 220,
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
              We could not load merchants
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
        ) : merchants.length ? (
          <section
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Merchants"
          >
            {merchants.map((merchant) => (
              <button
                key={merchant.id}
                type="button"
                onClick={() => onOpenMerchant?.(merchant)}
                className="overflow-hidden rounded-[22px] border bg-white text-left outline-none transition hover:-translate-y-0.5 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                style={{
                  borderColor: 'var(--mzaya-border)',
                  boxShadow: 'var(--mzaya-shadow-sm)',
                }}
              >
                <div
                  className="aspect-[16/8] w-full"
                  style={{
                    background:
                      merchant.image_url || merchant.imageUrl
                        ? `url(${merchant.image_url ?? merchant.imageUrl}) center/cover`
                        : 'var(--mzaya-surface-muted)',
                  }}
                  aria-hidden="true"
                />
                <div className="p-4">
                  <h3
                    className="text-[14px] font-semibold"
                    style={{ color: 'var(--mzaya-text-primary)' }}
                  >
                    {merchant.name}
                  </h3>
                  <div
                    className="mt-2 flex flex-wrap items-center gap-3 text-[11px]"
                    style={{ color: 'var(--mzaya-text-muted)' }}
                  >
                    {merchant.category && <span>{merchant.category}</span>}
                    {(merchant.eta ?? merchant.delivery_eta) && (
                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={13} strokeWidth={1.8} />
                        {merchant.eta ?? merchant.delivery_eta}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </section>
        ) : (
          <section
            className="mt-6 rounded-[24px] border bg-white px-6 py-12 text-center"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          >
            <Store
              className="mx-auto"
              size={25}
              strokeWidth={1.8}
              style={{ color: 'var(--mzaya-primary)' }}
              aria-hidden="true"
            />
            <h2
              className="mt-4 text-[20px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              No merchants found
            </h2>
            <p
              className="mx-auto mt-2 max-w-[360px] text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Try another search or category.
            </p>
          </section>
        )}
      </main>
    </PageShell>
  )
}
