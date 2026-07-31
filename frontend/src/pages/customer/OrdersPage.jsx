/**
 * ============================================================================
 * MZAYA
 * Page: OrdersPage
 * Path: frontend/src/pages/customer/OrdersPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Composes the customer's active and historical order experience using the
 * shared Mzaya order components.
 *
 * Responsibilities
 * ----------------
 * • Display active and past order groups.
 * • Provide accessible filter tabs.
 * • Render order cards, loading placeholders and empty states.
 * • Forward order selection and browse actions to the application layer.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not fetch orders.
 * • Does not navigate directly.
 * • Does not normalize backend statuses.
 * • Does not determine whether an order is trackable or reorderable.
 *
 * Integration Contract
 * --------------------
 * The connected page/container should:
 * 1. Fetch and normalize customer orders.
 * 2. Split orders into active and past collections.
 * 3. Provide loading and error state.
 * 4. Handle navigation when onOrderSelect or onBrowse is called.
 *
 * Props
 * -----
 * activeOrders?: Array<Order>
 * pastOrders?: Array<Order>
 * loading?: boolean
 * error?: string | null
 * initialTab?: "active" | "past"
 * onOrderSelect?: (order: Order) => void
 * onBrowse?: () => void
 * onRetry?: () => void
 * onBack?: () => void
 *
 * Dependencies
 * ------------
 * • AppHeader.jsx
 * • PageShell.jsx
 * • OrderCard.jsx
 * • OrdersEmptyState.jsx
 * • OrdersFilterTabs.jsx
 * • Button.jsx
 *
 * Accessibility
 * -------------
 * • Uses tab semantics through OrdersFilterTabs.
 * • Exposes loading and error updates through aria-live.
 * • Maintains a visible page heading.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { useMemo, useState } from 'react'
import AppHeader from '../../components/layout/AppHeader'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'
import OrderCard from '../../components/orders/OrderCard'
import OrdersEmptyState from '../../components/orders/OrdersEmptyState'
import OrdersFilterTabs from '../../components/orders/OrdersFilterTabs'

function OrderCardSkeleton() {
  return (
    <div
      className="animate-pulse rounded-[22px] border bg-white p-5"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div
            className="h-4 w-36 rounded-full"
            style={{ background: 'var(--mzaya-surface-muted)' }}
          />
          <div
            className="mt-3 h-3 w-48 rounded-full"
            style={{ background: 'var(--mzaya-surface-muted)' }}
          />
        </div>

        <div
          className="h-7 w-20 rounded-full"
          style={{ background: 'var(--mzaya-surface-muted)' }}
        />
      </div>

      <div
        className="mt-5 border-t pt-4"
        style={{ borderColor: 'var(--mzaya-border)' }}
      >
        <div
          className="h-3 w-44 rounded-full"
          style={{ background: 'var(--mzaya-surface-muted)' }}
        />
        <div
          className="mt-3 h-5 w-24 rounded-full"
          style={{ background: 'var(--mzaya-surface-muted)' }}
        />
      </div>
    </div>
  )
}

export default function OrdersPage({
  activeOrders = [],
  pastOrders = [],
  loading = false,
  error = null,
  initialTab = 'active',
  onOrderSelect,
  onBrowse,
  onRetry,
  onBack,
}) {
  const [selectedTab, setSelectedTab] = useState(initialTab)

  const tabs = useMemo(
    () => [
      {
        id: 'active',
        label: 'Active',
        count: activeOrders.length,
      },
      {
        id: 'past',
        label: 'Past',
        count: pastOrders.length,
      },
    ],
    [activeOrders.length, pastOrders.length]
  )

  const visibleOrders =
    selectedTab === 'active' ? activeOrders : pastOrders

  const emptyCopy =
    selectedTab === 'active'
      ? {
          title: 'No active orders',
          message:
            'When you place an order, its live progress will appear here.',
          actionLabel: 'Browse Mzaya',
        }
      : {
          title: 'No past orders',
          message:
            'Completed and cancelled orders will appear here for easy reference.',
          actionLabel: 'Browse Mzaya',
        }

  return (
    <PageShell>
      <AppHeader
        title="Your orders"
        subtitle="Track active deliveries and review past orders."
        onBack={onBack}
      />

      <main className="mx-auto w-full max-w-3xl px-4 pb-10 pt-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <OrdersFilterTabs
            tabs={tabs}
            value={selectedTab}
            onChange={setSelectedTab}
          />
        </div>

        <div className="mt-5" aria-live="polite">
          {loading ? (
            <div className="space-y-4" aria-label="Loading orders">
              <OrderCardSkeleton />
              <OrderCardSkeleton />
              <OrderCardSkeleton />
            </div>
          ) : error ? (
            <section
              className="rounded-[22px] border bg-white px-6 py-10 text-center"
              style={{
                borderColor: 'var(--mzaya-border)',
                boxShadow: 'var(--mzaya-shadow-sm)',
              }}
            >
              <h2
                className="text-[18px] font-semibold"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                We could not load your orders
              </h2>

              <p
                className="mx-auto mt-2 max-w-[360px] text-[13px] leading-6"
                style={{ color: 'var(--mzaya-text-muted)' }}
              >
                {error}
              </p>

              {onRetry && (
                <Button onClick={onRetry} className="mt-5 min-w-[140px]">
                  Try again
                </Button>
              )}
            </section>
          ) : visibleOrders.length ? (
            <section
              className="space-y-4"
              aria-label={
                selectedTab === 'active' ? 'Active orders' : 'Past orders'
              }
            >
              {visibleOrders.map((order) => (
                <OrderCard
                  key={order.id ?? order.reference ?? order.order_reference}
                  order={order}
                  actionLabel={
                    selectedTab === 'active' ? 'Track order' : 'View order'
                  }
                  onAction={onOrderSelect}
                />
              ))}
            </section>
          ) : (
            <OrdersEmptyState
              title={emptyCopy.title}
              message={emptyCopy.message}
              actionLabel={emptyCopy.actionLabel}
              onAction={onBrowse}
            />
          )}
        </div>
      </main>
    </PageShell>
  )
}
