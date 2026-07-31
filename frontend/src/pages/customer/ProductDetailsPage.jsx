/**
 * ============================================================================
 * MZAYA
 * Page: ProductDetailsPage
 * Path: frontend/src/pages/customer/ProductDetailsPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes one product-detail experience and controlled add-to-cart action.
 *
 * Responsibilities
 * ----------------
 * • Display product imagery, price, description and options.
 * • Display parent-controlled quantity and selected options.
 * • Forward selection, quantity and add-to-cart actions.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not calculate price, stock or option validity.
 * • Does not mutate cart state.
 * • Does not perform merchant or product requests.
 * • Does not navigate directly.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { ArrowLeft, Minus, Plus, ShoppingBag } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'

export default function ProductDetailsPage({
  product,
  quantity = 1,
  selections = {},
  loading = false,
  error = null,
  adding = false,
  onBack,
  onRetry,
  onQuantityChange,
  onOptionChange,
  onAddToCart,
}) {
  return (
    <PageShell>
      <main
        className="mx-auto w-full max-w-5xl pb-32"
        aria-live="polite"
      >
        <div className="relative">
          <div
            className="aspect-[4/3] w-full sm:aspect-[16/8]"
            style={{
              background:
                product?.image_url || product?.imageUrl
                  ? `url(${product.image_url ?? product.imageUrl}) center/cover`
                  : 'var(--mzaya-surface-muted)',
            }}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={onBack}
            className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-[15px] bg-white/95 outline-none backdrop-blur focus-visible:[box-shadow:var(--mzaya-focus-ring)] sm:left-6"
            aria-label="Go back"
          >
            <ArrowLeft size={19} strokeWidth={1.8} />
          </button>
        </div>

        <div className="px-4 pt-6 sm:px-6">
          {loading ? (
            <div
              className="animate-pulse rounded-[24px] border bg-white p-6"
              style={{
                minHeight: 360,
                borderColor: 'var(--mzaya-border)',
              }}
              aria-label="Loading product"
            />
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
                We could not load this product
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
          ) : !product ? (
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
                Product unavailable
              </h1>
            </section>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              <section>
                {product.merchant_name && (
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: 'var(--mzaya-primary)' }}
                  >
                    {product.merchant_name}
                  </p>
                )}

                <h1
                  className="mt-2 text-[30px] font-semibold tracking-[-0.04em]"
                  style={{ color: 'var(--mzaya-text-primary)' }}
                >
                  {product.name}
                </h1>

                <p
                  className="mt-3 text-[18px] font-semibold"
                  style={{ color: 'var(--mzaya-primary)' }}
                >
                  {product.formatted_price ??
                    product.formattedPrice ??
                    product.price}
                </p>

                {product.description && (
                  <p
                    className="mt-5 text-[13px] leading-7"
                    style={{ color: 'var(--mzaya-text-secondary)' }}
                  >
                    {product.description}
                  </p>
                )}

                {product.option_groups?.map((group) => (
                  <fieldset
                    key={group.id}
                    className="mt-7"
                    disabled={adding}
                  >
                    <legend
                      className="text-[14px] font-semibold"
                      style={{ color: 'var(--mzaya-text-primary)' }}
                    >
                      {group.name}
                      {group.required && (
                        <span
                          className="ml-2 text-[11px] font-normal"
                          style={{ color: 'var(--mzaya-text-muted)' }}
                        >
                          Required
                        </span>
                      )}
                    </legend>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {group.options?.map((option) => {
                        const selected = selections[group.id] === option.id
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => onOptionChange?.(group, option)}
                            className="flex items-center justify-between rounded-[16px] border px-4 py-3 text-left outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                            style={{
                              borderColor: selected
                                ? 'var(--mzaya-primary)'
                                : 'var(--mzaya-border)',
                              background: selected
                                ? 'var(--mzaya-primary-soft)'
                                : 'var(--mzaya-surface)',
                            }}
                            aria-pressed={selected}
                          >
                            <span
                              className="text-[12px] font-medium"
                              style={{ color: 'var(--mzaya-text-primary)' }}
                            >
                              {option.name}
                            </span>
                            {option.formatted_price && (
                              <span
                                className="text-[11px]"
                                style={{ color: 'var(--mzaya-text-muted)' }}
                              >
                                {option.formatted_price}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </fieldset>
                ))}
              </section>

              <aside
                className="h-fit rounded-[22px] border bg-white p-5"
                style={{
                  borderColor: 'var(--mzaya-border)',
                  boxShadow: 'var(--mzaya-shadow-sm)',
                }}
              >
                <h2
                  className="text-[14px] font-semibold"
                  style={{ color: 'var(--mzaya-text-primary)' }}
                >
                  Quantity
                </h2>

                <div className="mt-4 flex items-center justify-between rounded-[16px] border p-2"
                  style={{ borderColor: 'var(--mzaya-border)' }}
                >
                  <button
                    type="button"
                    onClick={() => onQuantityChange?.(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || adding}
                    className="flex h-10 w-10 items-center justify-center rounded-[12px] outline-none disabled:opacity-40 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={17} strokeWidth={1.8} />
                  </button>

                  <span
                    className="text-[15px] font-semibold"
                    style={{ color: 'var(--mzaya-text-primary)' }}
                    aria-live="polite"
                  >
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => onQuantityChange?.(quantity + 1)}
                    disabled={adding}
                    className="flex h-10 w-10 items-center justify-center rounded-[12px] outline-none disabled:opacity-40 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                    aria-label="Increase quantity"
                  >
                    <Plus size={17} strokeWidth={1.8} />
                  </button>
                </div>
              </aside>
            </div>
          )}
        </div>

        {product && !loading && !error && (
          <div className="fixed inset-x-0 bottom-4 z-20 px-4">
            <div className="mx-auto max-w-xl">
              <Button
                onClick={() =>
                  onAddToCart?.({ product, quantity, selections })
                }
                leadingIcon={ShoppingBag}
                loading={adding}
                disabled={Boolean(product.unavailable)}
                className="w-full justify-between"
              >
                <span>
                  {product.unavailable ? 'Unavailable' : 'Add to cart'}
                </span>
                {!product.unavailable && (
                  <span>
                    {product.formatted_total ??
                      product.formattedTotal ??
                      product.formatted_price ??
                      product.formattedPrice ??
                      product.price}
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </PageShell>
  )
}
