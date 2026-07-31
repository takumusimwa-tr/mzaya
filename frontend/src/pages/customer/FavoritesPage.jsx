/**
 * ============================================================================
 * MZAYA
 * Page: FavoritesPage
 * Path: frontend/src/pages/customer/FavoritesPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes the customer's saved merchants and products.
 *
 * Responsibilities
 * ----------------
 * • Display saved items in merchant and product tabs.
 * • Forward selection and remove actions.
 * • Render loading, error and empty states.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not persist favorites.
 * • Does not fetch or rank favorite items.
 * • Does not navigate directly.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { ArrowLeft, Heart, Package, Store } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'

export default function FavoritesPage({
  activeTab = 'merchants',
  merchants = [],
  products = [],
  loading = false,
  error = null,
  removingId = null,
  onBack,
  onRetry,
  onTabChange,
  onOpenMerchant,
  onOpenProduct,
  onRemoveFavorite,
}) {
  const items = activeTab === 'products' ? products : merchants

  return (
    <PageShell>
      <main
        className="mx-auto w-full max-w-5xl px-4 pb-12 pt-4 sm:px-6"
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
              Favorites
            </h1>
            <p
              className="mt-1 text-[12px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Your saved merchants and products.
            </p>
          </div>
        </header>

        <div
          className="mt-6 grid grid-cols-2 rounded-[16px] border p-1"
          style={{
            borderColor: 'var(--mzaya-border)',
            background: 'var(--mzaya-surface-muted)',
          }}
          role="tablist"
          aria-label="Favorite type"
        >
          {[
            { id: 'merchants', label: 'Merchants' },
            { id: 'products', label: 'Products' },
          ].map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange?.(tab.id)}
                className="rounded-[12px] px-4 py-2.5 text-[12px] font-semibold outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                style={{
                  background: active ? 'var(--mzaya-surface)' : 'transparent',
                  color: active
                    ? 'var(--mzaya-text-primary)'
                    : 'var(--mzaya-text-muted)',
                  boxShadow: active ? 'var(--mzaya-shadow-xs)' : 'none',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[22px] border"
                style={{
                  minHeight: 140,
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
              We could not load favorites
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
        ) : items.length ? (
          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            {items.map((item) => {
              const isProduct = activeTab === 'products'
              const Icon = isProduct ? Package : Store
              return (
                <article
                  key={item.id}
                  className="flex items-center gap-4 rounded-[22px] border bg-white p-4"
                  style={{
                    borderColor: 'var(--mzaya-border)',
                    boxShadow: 'var(--mzaya-shadow-sm)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      isProduct
                        ? onOpenProduct?.(item)
                        : onOpenMerchant?.(item)
                    }
                    className="flex min-w-0 flex-1 items-center gap-4 text-left outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                  >
                    <div
                      className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[17px]"
                      style={{
                        background:
                          item.image_url || item.imageUrl
                            ? `url(${item.image_url ?? item.imageUrl}) center/cover`
                            : 'var(--mzaya-primary-soft)',
                        color: 'var(--mzaya-primary)',
                      }}
                    >
                      {!item.image_url && !item.imageUrl && (
                        <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="truncate text-[13px] font-semibold"
                        style={{ color: 'var(--mzaya-text-primary)' }}
                      >
                        {item.name ?? item.title}
                      </h3>
                      {item.description && (
                        <p
                          className="mt-1 line-clamp-2 text-[11px] leading-5"
                          style={{ color: 'var(--mzaya-text-muted)' }}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveFavorite?.(item)}
                    disabled={removingId === item.id}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[13px] outline-none disabled:opacity-50 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                    style={{ color: 'var(--mzaya-error)' }}
                    aria-label={`Remove ${item.name ?? 'item'} from favorites`}
                  >
                    <Heart
                      size={18}
                      strokeWidth={1.8}
                      fill="currentColor"
                      aria-hidden="true"
                    />
                  </button>
                </article>
              )
            })}
          </section>
        ) : (
          <section
            className="mt-6 rounded-[24px] border bg-white px-6 py-12 text-center"
            style={{
              borderColor: 'var(--mzaya-border)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          >
            <Heart
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
              No favorites yet
            </h2>
            <p
              className="mx-auto mt-2 max-w-[360px] text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Save merchants and products to find them quickly later.
            </p>
          </section>
        )}
      </main>
    </PageShell>
  )
}
