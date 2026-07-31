/**
 * ============================================================================
 * MZAYA
 * Page: CategoryPage
 * Path: frontend/src/pages/customer/CategoryPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes a category-specific discovery page.
 *
 * Responsibilities
 * ----------------
 * • Display category identity, subcategories and related merchants.
 * • Forward subcategory and merchant-selection actions.
 * • Render loading, error and empty states.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not fetch category content.
 * • Does not sort or filter merchants.
 * • Does not navigate directly.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { ArrowLeft, ChevronRight, Grid3X3 } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'

export default function CategoryPage({
  category,
  subcategories = [],
  merchants = [],
  loading = false,
  error = null,
  onBack,
  onRetry,
  onOpenSubcategory,
  onOpenMerchant,
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
              {category?.name ?? category?.title ?? 'Category'}
            </h1>
            {category?.description && (
              <p
                className="mt-1 text-[12px]"
                style={{ color: 'var(--mzaya-text-muted)' }}
              >
                {category.description}
              </p>
            )}
          </div>
        </header>

        {loading ? (
          <div className="mt-6 space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-[20px] border"
                  style={{
                    minHeight: 100,
                    borderColor: 'var(--mzaya-border)',
                    background: 'var(--mzaya-surface)',
                  }}
                />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-[22px] border"
                  style={{
                    minHeight: 220,
                    borderColor: 'var(--mzaya-border)',
                    background: 'var(--mzaya-surface)',
                  }}
                />
              ))}
            </div>
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
              We could not load this category
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
        ) : (
          <>
            {subcategories.length > 0 && (
              <section className="mt-6" aria-labelledby="subcategories-heading">
                <h2
                  id="subcategories-heading"
                  className="mb-3 text-[16px] font-semibold"
                  style={{ color: 'var(--mzaya-text-primary)' }}
                >
                  Browse
                </h2>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {subcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      type="button"
                      onClick={() => onOpenSubcategory?.(subcategory)}
                      className="flex items-center justify-between gap-3 rounded-[20px] border bg-white p-4 text-left outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                      style={{
                        borderColor: 'var(--mzaya-border)',
                        boxShadow: 'var(--mzaya-shadow-xs)',
                      }}
                    >
                      <span
                        className="text-[12px] font-semibold"
                        style={{ color: 'var(--mzaya-text-primary)' }}
                      >
                        {subcategory.name ?? subcategory.title}
                      </span>
                      <ChevronRight
                        size={16}
                        strokeWidth={1.8}
                        aria-hidden="true"
                        style={{ color: 'var(--mzaya-text-muted)' }}
                      />
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-8" aria-labelledby="category-merchants-heading">
              <h2
                id="category-merchants-heading"
                className="mb-3 text-[16px] font-semibold"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                Available merchants
              </h2>

              {merchants.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                        className="aspect-[16/8]"
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
                        {merchant.description && (
                          <p
                            className="mt-1 line-clamp-2 text-[11px] leading-5"
                            style={{ color: 'var(--mzaya-text-muted)' }}
                          >
                            {merchant.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div
                  className="rounded-[22px] border bg-white px-6 py-12 text-center"
                  style={{
                    borderColor: 'var(--mzaya-border)',
                    boxShadow: 'var(--mzaya-shadow-sm)',
                  }}
                >
                  <Grid3X3
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
                    Nothing available yet
                  </h3>
                  <p
                    className="mx-auto mt-2 max-w-sm text-[13px] leading-6"
                    style={{ color: 'var(--mzaya-text-muted)' }}
                  >
                    Merchants in this category are not available right now.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </PageShell>
  )
}
