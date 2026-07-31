/**
 * ============================================================================
 * MZAYA
 * Page: MerchantPage
 * Path: frontend/src/pages/customer/MerchantPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes one merchant storefront and product catalogue.
 *
 * Responsibilities
 * ----------------
 * • Display merchant identity, operating status, ETA and fulfilment information.
 * • Render product categories and products.
 * • Forward product, category and cart actions to the application layer.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not fetch merchant data.
 * • Does not calculate availability, price, ETA or delivery fees.
 * • Does not mutate the cart.
 * • Does not navigate directly.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { ArrowLeft, Clock3, Search, ShoppingBag, Star } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'

export default function MerchantPage({
  merchant,
  categories = [],
  activeCategoryId,
  products = [],
  cartItemCount = 0,
  cartTotal,
  loading = false,
  error = null,
  onBack,
  onRetry,
  onSearch,
  onCategoryChange,
  onOpenProduct,
  onOpenCart,
}) {
  return (
    <PageShell>
      <main
        className="mx-auto w-full max-w-6xl pb-28"
        aria-live="polite"
      >
        <section
          className="relative min-h-[260px] overflow-hidden"
          style={{
            background:
              merchant?.cover_image_url || merchant?.coverImageUrl
                ? `linear-gradient(180deg, rgba(7,24,18,.15), rgba(7,24,18,.75)), url(${
                    merchant.cover_image_url ?? merchant.coverImageUrl
                  }) center/cover`
                : 'linear-gradient(145deg, var(--mzaya-primary), var(--mzaya-primary-dark))',
          }}
        >
          <div className="absolute left-4 top-4 z-10 flex gap-2 sm:left-6">
            <button
              type="button"
              onClick={onBack}
              className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-white/95 outline-none backdrop-blur focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
              aria-label="Go back"
            >
              <ArrowLeft size={19} strokeWidth={1.8} />
            </button>
            {onSearch && (
              <button
                type="button"
                onClick={onSearch}
                className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-white/95 outline-none backdrop-blur focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                aria-label="Search this store"
              >
                <Search size={19} strokeWidth={1.8} />
              </button>
            )}
          </div>

          {!loading && merchant && (
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
                {merchant.category ?? 'Mzaya merchant'}
              </p>
              <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.04em] sm:text-[38px]">
                {merchant.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-white/85">
                {merchant.rating && (
                  <span className="inline-flex items-center gap-1">
                    <Star size={14} fill="currentColor" strokeWidth={1.5} />
                    {merchant.rating}
                  </span>
                )}
                {(merchant.eta ?? merchant.delivery_eta) && (
                  <span className="inline-flex items-center gap-1">
                    <Clock3 size={14} strokeWidth={1.8} />
                    {merchant.eta ?? merchant.delivery_eta}
                  </span>
                )}
                {merchant.status_label && <span>{merchant.status_label}</span>}
              </div>
            </div>
          )}
        </section>

        <div className="px-4 pt-5 sm:px-6">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-[20px] border"
                  style={{
                    minHeight: 230,
                    borderColor: 'var(--mzaya-border)',
                    background: 'var(--mzaya-surface)',
                  }}
                  aria-hidden="true"
                />
              ))}
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
                We could not load this store
              </h1>
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
          ) : !merchant ? (
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
                Store unavailable
              </h1>
            </section>
          ) : (
            <>
              {categories.length > 0 && (
                <div
                  className="flex gap-2 overflow-x-auto pb-2"
                  aria-label="Product categories"
                >
                  {categories.map((category) => {
                    const active = activeCategoryId === category.id
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => onCategoryChange?.(category)}
                        className="whitespace-nowrap rounded-full border px-4 py-2 text-[12px] font-medium outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                        style={{
                          borderColor: active
                            ? 'var(--mzaya-primary)'
                            : 'var(--mzaya-border)',
                          background: active
                            ? 'var(--mzaya-primary)'
                            : 'var(--mzaya-surface)',
                          color: active
                            ? 'white'
                            : 'var(--mzaya-text-secondary)',
                        }}
                        aria-pressed={active}
                      >
                        {category.name ?? category.title}
                      </button>
                    )
                  })}
                </div>
              )}

              <section className="mt-5" aria-labelledby="products-heading">
                <h2
                  id="products-heading"
                  className="mb-3 text-[17px] font-semibold"
                  style={{ color: 'var(--mzaya-text-primary)' }}
                >
                  {categories.find((item) => item.id === activeCategoryId)?.name ??
                    'Products'}
                </h2>

                {products.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => onOpenProduct?.(product)}
                        className="overflow-hidden rounded-[22px] border bg-white text-left outline-none transition hover:-translate-y-0.5 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                        style={{
                          borderColor: 'var(--mzaya-border)',
                          boxShadow: 'var(--mzaya-shadow-sm)',
                        }}
                      >
                        <div
                          className="aspect-[4/3] w-full"
                          style={{
                            background:
                              product.image_url || product.imageUrl
                                ? `url(${
                                    product.image_url ?? product.imageUrl
                                  }) center/cover`
                                : 'var(--mzaya-surface-muted)',
                          }}
                          aria-hidden="true"
                        />
                        <div className="p-4">
                          <h3
                            className="line-clamp-1 text-[14px] font-semibold"
                            style={{ color: 'var(--mzaya-text-primary)' }}
                          >
                            {product.name}
                          </h3>
                          {product.description && (
                            <p
                              className="mt-1 line-clamp-2 text-[11px] leading-5"
                              style={{ color: 'var(--mzaya-text-muted)' }}
                            >
                              {product.description}
                            </p>
                          )}
                          <p
                            className="mt-3 text-[13px] font-semibold"
                            style={{ color: 'var(--mzaya-primary)' }}
                          >
                            {product.formatted_price ??
                              product.formattedPrice ??
                              product.price}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p
                    className="rounded-[20px] border bg-white px-5 py-10 text-center text-[13px]"
                    style={{
                      borderColor: 'var(--mzaya-border)',
                      color: 'var(--mzaya-text-muted)',
                    }}
                  >
                    No products are available in this section right now.
                  </p>
                )}
              </section>
            </>
          )}
        </div>

        {cartItemCount > 0 && onOpenCart && (
          <div className="fixed inset-x-0 bottom-4 z-20 px-4">
            <div className="mx-auto max-w-xl">
              <Button
                onClick={onOpenCart}
                leadingIcon={ShoppingBag}
                className="w-full justify-between"
              >
                <span>
                  View cart · {cartItemCount} item
                  {cartItemCount === 1 ? '' : 's'}
                </span>
                {cartTotal && <span>{cartTotal}</span>}
              </Button>
            </div>
          </div>
        )}
      </main>
    </PageShell>
  )
}
