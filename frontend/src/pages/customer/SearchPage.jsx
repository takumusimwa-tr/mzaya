/**
 * ============================================================================
 * MZAYA
 * Page: SearchPage
 * Path: frontend/src/pages/customer/SearchPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Provides a controlled search experience across merchants, products and
 * services.
 *
 * Responsibilities
 * ----------------
 * • Display the current query, filters, recent searches and result groups.
 * • Forward query and selection events to the application layer.
 * • Render loading, empty and error states.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not execute search requests.
 * • Does not debounce, rank or personalize results.
 * • Does not persist recent searches.
 * • Does not navigate directly.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { ArrowLeft, Clock3, Search, Store, Tag, X } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'

export default function SearchPage({
  query = '',
  activeFilter = 'all',
  filters = [],
  recentSearches = [],
  results = [],
  loading = false,
  error = null,
  onBack,
  onQueryChange,
  onSubmit,
  onClear,
  onFilterChange,
  onRecentSearch,
  onResultSelect,
  onRetry,
}) {
  const hasQuery = query.trim().length > 0

  return (
    <PageShell>
      <main
        className="mx-auto w-full max-w-5xl px-4 pb-12 pt-4 sm:px-6"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[15px] border bg-white outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{
              borderColor: 'var(--mzaya-border)',
              color: 'var(--mzaya-text-primary)',
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={19} strokeWidth={1.8} />
          </button>

          <form
            className="relative flex-1"
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
              onSubmit?.(query)
            }}
          >
            <Search
              aria-hidden="true"
              size={18}
              strokeWidth={1.8}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--mzaya-text-muted)' }}
            />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => onQueryChange?.(event.target.value)}
              placeholder="Search Mzaya"
              className="h-12 w-full rounded-[17px] border bg-white pl-12 pr-12 text-[13px] outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
              style={{
                borderColor: 'var(--mzaya-border)',
                color: 'var(--mzaya-text-primary)',
                boxShadow: 'var(--mzaya-shadow-sm)',
              }}
              aria-label="Search Mzaya"
            />
            {hasQuery && (
              <button
                type="button"
                onClick={onClear}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                style={{ color: 'var(--mzaya-text-muted)' }}
                aria-label="Clear search"
              >
                <X size={16} strokeWidth={1.8} />
              </button>
            )}
          </form>
        </div>

        {filters.length > 0 && (
          <div
            className="mt-5 flex gap-2 overflow-x-auto pb-1"
            aria-label="Search filters"
          >
            {filters.map((filter) => {
              const active = activeFilter === filter.id
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => onFilterChange?.(filter.id)}
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

        {!hasQuery && recentSearches.length > 0 ? (
          <section className="mt-7" aria-labelledby="recent-searches-heading">
            <h1
              id="recent-searches-heading"
              className="text-[16px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              Recent searches
            </h1>

            <div className="mt-3 overflow-hidden rounded-[20px] border bg-white">
              {recentSearches.map((term, index) => (
                <button
                  key={`${term}-${index}`}
                  type="button"
                  onClick={() => onRecentSearch?.(term)}
                  className={`flex w-full items-center gap-3 px-4 py-4 text-left outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)] ${
                    index ? 'border-t' : ''
                  }`}
                  style={{ borderColor: 'var(--mzaya-border)' }}
                >
                  <Clock3
                    size={16}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    style={{ color: 'var(--mzaya-text-muted)' }}
                  />
                  <span
                    className="text-[13px]"
                    style={{ color: 'var(--mzaya-text-secondary)' }}
                  >
                    {term}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : loading ? (
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[20px] border"
                style={{
                  minHeight: 110,
                  borderColor: 'var(--mzaya-border)',
                  background: 'var(--mzaya-surface)',
                }}
                aria-hidden="true"
              />
            ))}
          </div>
        ) : error ? (
          <section
            className="mt-7 rounded-[22px] border bg-white px-6 py-10 text-center"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          >
            <p
              className="text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              {error}
            </p>
            {onRetry && (
              <Button onClick={onRetry} className="mt-5">
                Try again
              </Button>
            )}
          </section>
        ) : hasQuery && results.length ? (
          <section className="mt-7" aria-labelledby="search-results-heading">
            <h1
              id="search-results-heading"
              className="text-[16px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              Results for “{query}”
            </h1>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {results.map((result) => {
                const Icon = result.type === 'merchant' ? Store : Tag
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    type="button"
                    onClick={() => onResultSelect?.(result)}
                    className="flex items-center gap-4 rounded-[20px] border bg-white p-4 text-left outline-none transition hover:-translate-y-0.5 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                    style={{
                      borderColor: 'var(--mzaya-border)',
                      boxShadow: 'var(--mzaya-shadow-xs)',
                    }}
                  >
                    <div
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px]"
                      style={{
                        background: 'var(--mzaya-primary-soft)',
                        color: 'var(--mzaya-primary)',
                      }}
                    >
                      <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="truncate text-[13px] font-semibold"
                        style={{ color: 'var(--mzaya-text-primary)' }}
                      >
                        {result.title ?? result.name}
                      </p>
                      {result.description && (
                        <p
                          className="mt-1 line-clamp-2 text-[11px] leading-5"
                          style={{ color: 'var(--mzaya-text-muted)' }}
                        >
                          {result.description}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        ) : hasQuery ? (
          <section
            className="mt-7 rounded-[22px] border bg-white px-6 py-12 text-center"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          >
            <Search
              aria-hidden="true"
              size={24}
              strokeWidth={1.8}
              className="mx-auto"
              style={{ color: 'var(--mzaya-primary)' }}
            />
            <h1
              className="mt-4 text-[19px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              No results found
            </h1>
            <p
              className="mx-auto mt-2 max-w-sm text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Try a different store, product or service name.
            </p>
          </section>
        ) : null}
      </main>
    </PageShell>
  )
}
