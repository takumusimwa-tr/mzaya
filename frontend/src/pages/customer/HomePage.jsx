/**
 * ============================================================================
 * MZAYA
 * Page: HomePage
 * Path: frontend/src/pages/customer/HomePage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes the primary customer landing experience for Mzaya.
 *
 * Responsibilities
 * ----------------
 * • Welcome the authenticated customer.
 * • Surface search, service categories, featured merchants and recent activity.
 * • Forward all discovery and navigation actions to the application layer.
 * • Render loading, partial-error and empty states without inventing data.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not fetch home-feed data.
 * • Does not determine service availability.
 * • Does not calculate merchant ranking, delivery fees or ETA.
 * • Does not navigate directly.
 * • Does not mutate cart or order state.
 *
 * Integration Contract
 * --------------------
 * The connected page/container should provide backend-normalized data and map
 * each callback to the existing router, store and service layer.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import {
  ArrowRight,
  Clock3,
  MapPin,
  Search,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import AppHeader from '../../components/layout/AppHeader'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'

function HomeSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading home">
      <div
        className="animate-pulse rounded-[26px] border p-6"
        style={{
          minHeight: 190,
          borderColor: 'var(--mzaya-border)',
          background: 'var(--mzaya-surface)',
        }}
        aria-hidden="true"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-[20px] border"
            style={{
              minHeight: 118,
              borderColor: 'var(--mzaya-border)',
              background: 'var(--mzaya-surface)',
            }}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-[22px] border"
            style={{
              minHeight: 210,
              borderColor: 'var(--mzaya-border)',
              background: 'var(--mzaya-surface)',
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  )
}

export default function HomePage({
  customer,
  location,
  categories = [],
  featuredMerchants = [],
  recentOrders = [],
  loading = false,
  error = null,
  onRetry,
  onSearch,
  onOpenLocation,
  onOpenCategory,
  onOpenMerchant,
  onOpenOrder,
  onOpenAllMerchants,
}) {
  const firstName =
    customer?.first_name ??
    customer?.firstName ??
    customer?.name?.split?.(' ')?.[0]

  return (
    <PageShell>
      <AppHeader
        title={firstName ? `Good morning, ${firstName}` : 'Good morning'}
        subtitle="What can Mzaya help you with today?"
      />

      <main
        className="mx-auto w-full max-w-6xl px-4 pb-12 pt-4 sm:px-6"
        aria-live="polite"
      >
        {loading ? (
          <HomeSkeleton />
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
              We could not load your Mzaya home
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
        ) : (
          <>
            <section
              className="overflow-hidden rounded-[28px] border p-6 sm:p-8"
              style={{
                borderColor: 'var(--mzaya-border)',
                background:
                  'linear-gradient(145deg, var(--mzaya-primary-soft), var(--mzaya-surface))',
                boxShadow: 'var(--mzaya-shadow-md)',
              }}
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <div
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold"
                    style={{
                      background: 'var(--mzaya-surface)',
                      color: 'var(--mzaya-primary)',
                    }}
                  >
                    <Sparkles size={14} strokeWidth={1.8} aria-hidden="true" />
                    Tumai Mzaya
                  </div>

                  <h1
                    className="mt-5 text-[30px] font-semibold tracking-[-0.04em] sm:text-[40px]"
                    style={{ color: 'var(--mzaya-text-primary)' }}
                  >
                    Everyday commerce, handled with care.
                  </h1>

                  <p
                    className="mt-3 max-w-xl text-[14px] leading-7"
                    style={{ color: 'var(--mzaya-text-secondary)' }}
                  >
                    Shop, send errands and arrange delivery from trusted local
                    businesses in one place.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onSearch}
                  className="flex min-h-13 w-full items-center gap-3 rounded-[18px] border bg-white px-4 text-left outline-none transition hover:-translate-y-0.5 focus-visible:[box-shadow:var(--mzaya-focus-ring)] lg:max-w-md"
                  style={{
                    borderColor: 'var(--mzaya-border)',
                    boxShadow: 'var(--mzaya-shadow-sm)',
                  }}
                >
                  <Search
                    aria-hidden="true"
                    size={19}
                    strokeWidth={1.8}
                    style={{ color: 'var(--mzaya-primary)' }}
                  />
                  <span
                    className="text-[13px]"
                    style={{ color: 'var(--mzaya-text-muted)' }}
                  >
                    Search stores, products or services
                  </span>
                </button>
              </div>

              {location && (
                <button
                  type="button"
                  onClick={onOpenLocation}
                  className="mt-5 inline-flex items-center gap-2 text-[12px] font-medium outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                  style={{ color: 'var(--mzaya-text-secondary)' }}
                >
                  <MapPin size={15} strokeWidth={1.8} aria-hidden="true" />
                  {location.label ?? location.name ?? location.address}
                </button>
              )}
            </section>

            <section className="mt-7" aria-labelledby="services-heading">
              <div className="mb-3 flex items-center justify-between">
                <h2
                  id="services-heading"
                  className="text-[17px] font-semibold"
                  style={{ color: 'var(--mzaya-text-primary)' }}
                >
                  Services
                </h2>
              </div>

              {categories.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {categories.map((category) => {
                    const Icon = category.icon ?? ShoppingBag
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => onOpenCategory?.(category)}
                        className="rounded-[20px] border bg-white p-4 text-left outline-none transition hover:-translate-y-0.5 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                        style={{
                          borderColor: 'var(--mzaya-border)',
                          boxShadow: 'var(--mzaya-shadow-xs)',
                        }}
                      >
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-[14px]"
                          style={{
                            background: 'var(--mzaya-primary-soft)',
                            color: 'var(--mzaya-primary)',
                          }}
                        >
                          <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                        </div>
                        <h3
                          className="mt-4 text-[13px] font-semibold"
                          style={{ color: 'var(--mzaya-text-primary)' }}
                        >
                          {category.title ?? category.name}
                        </h3>
                        {category.description && (
                          <p
                            className="mt-1 line-clamp-2 text-[11px] leading-5"
                            style={{ color: 'var(--mzaya-text-muted)' }}
                          >
                            {category.description}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p
                  className="rounded-[20px] border bg-white px-5 py-8 text-center text-[13px]"
                  style={{
                    borderColor: 'var(--mzaya-border)',
                    color: 'var(--mzaya-text-muted)',
                  }}
                >
                  Services are not available right now.
                </p>
              )}
            </section>

            <section className="mt-8" aria-labelledby="featured-heading">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2
                  id="featured-heading"
                  className="text-[17px] font-semibold"
                  style={{ color: 'var(--mzaya-text-primary)' }}
                >
                  Featured near you
                </h2>

                {onOpenAllMerchants && featuredMerchants.length > 0 && (
                  <button
                    type="button"
                    onClick={onOpenAllMerchants}
                    className="inline-flex items-center gap-1 text-[12px] font-semibold outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                    style={{ color: 'var(--mzaya-primary)' }}
                  >
                    View all
                    <ArrowRight size={15} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                )}
              </div>

              {featuredMerchants.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredMerchants.map((merchant) => (
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
                          className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]"
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
                </div>
              ) : (
                <p
                  className="rounded-[20px] border bg-white px-5 py-8 text-center text-[13px]"
                  style={{
                    borderColor: 'var(--mzaya-border)',
                    color: 'var(--mzaya-text-muted)',
                  }}
                >
                  No featured businesses are available right now.
                </p>
              )}
            </section>

            {recentOrders.length > 0 && (
              <section className="mt-8" aria-labelledby="recent-orders-heading">
                <h2
                  id="recent-orders-heading"
                  className="mb-3 text-[17px] font-semibold"
                  style={{ color: 'var(--mzaya-text-primary)' }}
                >
                  Recent orders
                </h2>

                <div className="space-y-3">
                  {recentOrders.slice(0, 3).map((order) => (
                    <button
                      key={order.id ?? order.order_id}
                      type="button"
                      onClick={() => onOpenOrder?.(order)}
                      className="flex w-full items-center justify-between gap-4 rounded-[18px] border bg-white p-4 text-left outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                      style={{
                        borderColor: 'var(--mzaya-border)',
                        boxShadow: 'var(--mzaya-shadow-xs)',
                      }}
                    >
                      <div>
                        <p
                          className="text-[13px] font-semibold"
                          style={{ color: 'var(--mzaya-text-primary)' }}
                        >
                          {order.merchant_name ?? order.merchantName ?? 'Mzaya order'}
                        </p>
                        <p
                          className="mt-1 text-[11px]"
                          style={{ color: 'var(--mzaya-text-muted)' }}
                        >
                          {order.status_label ?? order.statusLabel ?? order.status}
                        </p>
                      </div>
                      <ArrowRight
                        size={17}
                        strokeWidth={1.8}
                        aria-hidden="true"
                        style={{ color: 'var(--mzaya-text-muted)' }}
                      />
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </PageShell>
  )
}
