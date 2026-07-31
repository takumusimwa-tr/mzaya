/**
 * ============================================================================
 * MZAYA
 * Page: CartPage
 * Path: frontend/src/pages/customer/CartPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes the customer cart experience using application-controlled cart data.
 *
 * Responsibilities
 * ----------------
 * • Display cart items, merchant context and order totals.
 * • Forward quantity, remove, clear-cart and checkout actions.
 * • Render loading, empty and error states.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not calculate authoritative totals.
 * • Does not mutate cart state.
 * • Does not validate stock or merchant availability.
 * • Does not navigate directly.
 *
 * Canonical Component Policy
 * --------------------------
 * Prefer canonical cart components from:
 *   frontend/src/components/cart/
 *
 * Replace page-local cart rows and summaries during final deduplication.
 *
 * Integration Contract
 * --------------------
 * The parent/container must supply backend- or store-normalized cart data and
 * own all cart mutations, validation and navigation.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'

export default function CartPage({
  cart,
  items = [],
  loading = false,
  error = null,
  updatingItemId = null,
  removingItemId = null,
  clearing = false,
  onBack,
  onRetry,
  onQuantityChange,
  onRemoveItem,
  onClearCart,
  onCheckout,
}) {
  const hasItems = items.length > 0

  return (
    <PageShell>
      <main
        className="mx-auto w-full max-w-5xl px-4 pb-28 pt-4 sm:px-6"
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
              Your cart
            </h1>
            <p
              className="mt-1 text-[12px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Review your order before checkout.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-[20px] border"
                  style={{
                    minHeight: 132,
                    borderColor: 'var(--mzaya-border)',
                    background: 'var(--mzaya-surface)',
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
            <div
              className="animate-pulse rounded-[22px] border"
              style={{
                minHeight: 300,
                borderColor: 'var(--mzaya-border)',
                background: 'var(--mzaya-surface)',
              }}
              aria-hidden="true"
            />
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
              We could not load your cart
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
        ) : !hasItems ? (
          <section
            className="mt-6 rounded-[24px] border bg-white px-6 py-14 text-center"
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
              <ShoppingBag size={24} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <h2
              className="mt-5 text-[20px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              Your cart is empty
            </h2>
            <p
              className="mx-auto mt-2 max-w-[360px] text-[13px] leading-6"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Add products from a merchant to begin your order.
            </p>
          </section>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
            <section aria-label="Cart items" className="space-y-3">
              <div className="mb-2 flex items-center justify-between gap-4">
                <div>
                  <h2
                    className="text-[15px] font-semibold"
                    style={{ color: 'var(--mzaya-text-primary)' }}
                  >
                    {cart?.merchant_name ?? cart?.merchantName ?? 'Mzaya order'}
                  </h2>
                  <p
                    className="mt-1 text-[11px]"
                    style={{ color: 'var(--mzaya-text-muted)' }}
                  >
                    {items.length} item{items.length === 1 ? '' : 's'}
                  </p>
                </div>

                {onClearCart && (
                  <button
                    type="button"
                    onClick={onClearCart}
                    disabled={clearing}
                    className="text-[12px] font-medium outline-none disabled:opacity-50 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                    style={{ color: 'var(--mzaya-error)' }}
                  >
                    {clearing ? 'Clearing…' : 'Clear cart'}
                  </button>
                )}
              </div>

              {items.map((item) => {
                const id = item.id ?? item.cart_item_id ?? item.cartItemId
                const quantity = item.quantity ?? 1
                const updating = updatingItemId === id
                const removing = removingItemId === id

                return (
                  <article
                    key={id}
                    className="flex gap-4 rounded-[20px] border bg-white p-4"
                    style={{
                      borderColor: 'var(--mzaya-border)',
                      boxShadow: 'var(--mzaya-shadow-xs)',
                    }}
                  >
                    <div
                      className="h-20 w-20 flex-shrink-0 rounded-[16px]"
                      style={{
                        background:
                          item.image_url || item.imageUrl
                            ? `url(${item.image_url ?? item.imageUrl}) center/cover`
                            : 'var(--mzaya-surface-muted)',
                      }}
                      aria-hidden="true"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3
                            className="text-[13px] font-semibold"
                            style={{ color: 'var(--mzaya-text-primary)' }}
                          >
                            {item.name ?? item.product_name ?? item.productName}
                          </h3>
                          {item.options_summary && (
                            <p
                              className="mt-1 text-[11px]"
                              style={{ color: 'var(--mzaya-text-muted)' }}
                            >
                              {item.options_summary}
                            </p>
                          )}
                        </div>

                        {onRemoveItem && (
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item)}
                            disabled={removing}
                            className="flex h-8 w-8 items-center justify-center rounded-[10px] outline-none disabled:opacity-50 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                            style={{ color: 'var(--mzaya-error)' }}
                            aria-label={`Remove ${item.name ?? 'item'}`}
                          >
                            <Trash2 size={16} strokeWidth={1.8} />
                          </button>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div
                          className="flex items-center rounded-[13px] border p-1"
                          style={{ borderColor: 'var(--mzaya-border)' }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              onQuantityChange?.(item, Math.max(1, quantity - 1))
                            }
                            disabled={quantity <= 1 || updating}
                            className="flex h-8 w-8 items-center justify-center rounded-[9px] disabled:opacity-40"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={15} strokeWidth={1.8} />
                          </button>
                          <span
                            className="min-w-8 text-center text-[12px] font-semibold"
                            style={{ color: 'var(--mzaya-text-primary)' }}
                          >
                            {updating ? '…' : quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onQuantityChange?.(item, quantity + 1)
                            }
                            disabled={updating}
                            className="flex h-8 w-8 items-center justify-center rounded-[9px] disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            <Plus size={15} strokeWidth={1.8} />
                          </button>
                        </div>

                        <p
                          className="text-[13px] font-semibold"
                          style={{ color: 'var(--mzaya-primary)' }}
                        >
                          {item.formatted_total ??
                            item.formattedTotal ??
                            item.total}
                        </p>
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>

            <aside
              className="h-fit rounded-[22px] border bg-white p-5"
              style={{
                borderColor: 'var(--mzaya-border)',
                boxShadow: 'var(--mzaya-shadow-sm)',
              }}
            >
              <h2
                className="text-[15px] font-semibold"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                Order summary
              </h2>

              <dl className="mt-5 space-y-3">
                {(cart?.summary_rows ?? cart?.summaryRows ?? []).map((row) => (
                  <div
                    key={row.id ?? row.label}
                    className="flex items-center justify-between gap-4"
                  >
                    <dt
                      className="text-[12px]"
                      style={{ color: 'var(--mzaya-text-muted)' }}
                    >
                      {row.label}
                    </dt>
                    <dd
                      className="text-[12px] font-medium"
                      style={{ color: 'var(--mzaya-text-primary)' }}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}

                <div
                  className="flex items-center justify-between gap-4 border-t pt-4"
                  style={{ borderColor: 'var(--mzaya-border)' }}
                >
                  <dt
                    className="text-[14px] font-semibold"
                    style={{ color: 'var(--mzaya-text-primary)' }}
                  >
                    Total
                  </dt>
                  <dd
                    className="text-[16px] font-semibold"
                    style={{ color: 'var(--mzaya-primary)' }}
                  >
                    {cart?.formatted_total ??
                      cart?.formattedTotal ??
                      cart?.total}
                  </dd>
                </div>
              </dl>

              <Button
                onClick={onCheckout}
                disabled={!onCheckout}
                className="mt-6 w-full"
              >
                Continue to checkout
              </Button>
            </aside>
          </div>
        )}
      </main>
    </PageShell>
  )
}
