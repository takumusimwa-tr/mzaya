/**
 * ============================================================================
 * MZAYA
 * Page: VendorAnalytics
 * Path: frontend/src/pages/vendor/VendorAnalytics.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Presents branch-aware vendor performance analytics.
 *
 * Preserved Integration
 * ---------------------
 * • GET /vendor-stats?range={week|month}&branch_id={id}
 * • React Query key: ['vendor-stats', range, branchId]
 * • 30-second refresh interval
 *
 * Non-Responsibilities
 * --------------------
 * • Does not calculate backend reporting metrics.
 * • Does not export or persist reports.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: refined visual and error states.
 * ============================================================================
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Banknote,
  BarChart3,
  PackageCheck,
  ReceiptText,
  TrendingUp,
} from 'lucide-react'
import api from '../../api/api'
import useActiveBranch from '../../store/useActiveBranch'
import LoadingScreen from '../../components/ui/LoadingScreen'
import VendorEmptyState from '../../components/vendor/VendorEmptyState'

export default function VendorAnalytics() {
  const [range, setRange] = useState('week')
  const branchId = useActiveBranch((state) => state.branchId)

  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['vendor-stats', range, branchId],
    queryFn: () =>
      api
        .get(
          `/vendor-stats?range=${range}${
            branchId ? `&branch_id=${branchId}` : ''
          }`
        )
        .then((response) => response.data.stats),
    refetchInterval: 30000,
  })

  if (isLoading) return <LoadingScreen message="Loading analytics..." />

  if (isError || !stats) {
    return (
      <div className="h-screen overflow-y-auto px-6 py-8">
        <VendorEmptyState
          icon={BarChart3}
          title="Analytics unavailable"
          message={
            error?.response?.data?.error ||
            'We could not load this branch’s performance data.'
          }
          actionLabel="Try again"
          onAction={refetch}
        />
      </div>
    )
  }

  const daily = Array.isArray(stats.daily) ? stats.daily : []
  const topItems = Array.isArray(stats.top_items) ? stats.top_items : []
  const maxRevenue = Math.max(...daily.map((day) => Number(day.revenue) || 0), 1)
  const maxOrders = Math.max(...daily.map((day) => Number(day.orders) || 0), 1)
  const maxItemQty = Math.max(...topItems.map((item) => Number(item.qty) || 0), 1)

  return (
    <div
      className="h-screen overflow-y-auto"
      style={{ background: 'var(--mzaya-background)' }}
    >
      <main className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: 'var(--mzaya-primary)' }}
            >
              Performance
            </p>
            <h1
              className="mt-2 text-[28px] font-semibold tracking-[-0.04em]"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              Analytics
            </h1>
            <p
              className="mt-2 text-[12px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Revenue, order volume and your strongest-selling items.
            </p>
          </div>

          <div
            className="inline-flex rounded-[15px] border p-1"
            style={{
              borderColor: 'var(--mzaya-border)',
              background: 'var(--mzaya-surface-muted)',
            }}
          >
            {[
              ['week', 'Last 7 days'],
              ['month', 'Last 30 days'],
            ].map(([value, label]) => {
              const active = range === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRange(value)}
                  className="rounded-[11px] px-4 py-2 text-[11px] font-semibold outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                  style={{
                    background: active ? 'var(--mzaya-surface)' : 'transparent',
                    color: active
                      ? 'var(--mzaya-text-primary)'
                      : 'var(--mzaya-text-muted)',
                    boxShadow: active ? 'var(--mzaya-shadow-xs)' : 'none',
                  }}
                  aria-pressed={active}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </header>

        <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={Banknote} label="Revenue" value={`US$${Number(stats.revenue_usd || 0).toFixed(2)}`} />
          <Metric icon={PackageCheck} label="Delivered orders" value={stats.delivered_orders || 0} />
          <Metric icon={ReceiptText} label="Total orders" value={stats.total_orders || 0} />
          <Metric icon={TrendingUp} label="Average order" value={`US$${Number(stats.avg_order_usd || 0).toFixed(2)}`} />
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-[1.45fr_1fr]">
          <ChartCard title="Revenue over time" description="Gross vendor revenue for the selected period.">
            {Number(stats.revenue_usd || 0) === 0 ? (
              <ChartEmpty message="No revenue in this period yet." />
            ) : (
              <>
                <div className="flex h-56 items-end gap-1.5" aria-label="Revenue chart">
                  {daily.map((day, index) => {
                    const height = ((Number(day.revenue) || 0) / maxRevenue) * 100
                    return (
                      <div key={`${day.date}-${index}`} className="group relative flex h-full flex-1 items-end">
                        <div
                          className="w-full rounded-t-[5px] transition-opacity group-hover:opacity-75"
                          style={{
                            height: `${Math.max(height, day.revenue > 0 ? 3 : 0)}%`,
                            background: 'var(--mzaya-primary)',
                          }}
                          aria-label={`${fmtDate(day.date)}: US$${Number(day.revenue || 0).toFixed(2)}`}
                        />
                      </div>
                    )
                  })}
                </div>
                <AxisLabels daily={daily} />
              </>
            )}
          </ChartCard>

          <ChartCard title="Orders per day" description="Daily order demand across this branch.">
            {Number(stats.total_orders || 0) === 0 ? (
              <ChartEmpty message="No orders in this period yet." />
            ) : (
              <>
                <div className="flex h-56 items-end gap-1.5" aria-label="Order volume chart">
                  {daily.map((day, index) => {
                    const height = ((Number(day.orders) || 0) / maxOrders) * 100
                    return (
                      <div key={`${day.date}-${index}`} className="flex h-full flex-1 items-end">
                        <div
                          className="w-full rounded-t-[5px]"
                          style={{
                            height: `${Math.max(height, day.orders > 0 ? 4 : 0)}%`,
                            background: 'var(--mzaya-primary-soft-strong, var(--mzaya-primary-soft))',
                            border: '1px solid var(--mzaya-primary)',
                          }}
                          aria-label={`${fmtDate(day.date)}: ${day.orders || 0} orders`}
                        />
                      </div>
                    )
                  })}
                </div>
                <AxisLabels daily={daily} />
              </>
            )}
          </ChartCard>
        </section>

        <ChartCard
          className="mt-5"
          title="Top items"
          description="Products generating the strongest demand."
        >
          {topItems.length === 0 ? (
            <ChartEmpty message="No item sales in this period yet." />
          ) : (
            <div className="space-y-5">
              {topItems.map((item, index) => (
                <div key={`${item.name}-${index}`}>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p
                        className="text-[13px] font-semibold"
                        style={{ color: 'var(--mzaya-text-primary)' }}
                      >
                        {item.name}
                      </p>
                      <p
                        className="mt-1 text-[10px]"
                        style={{ color: 'var(--mzaya-text-muted)' }}
                      >
                        {item.qty} sold
                      </p>
                    </div>
                    <p
                      className="text-[12px] font-semibold"
                      style={{ color: 'var(--mzaya-text-secondary)' }}
                    >
                      US${Number(item.revenue || 0).toFixed(2)}
                    </p>
                  </div>
                  <div
                    className="mt-2 h-2 overflow-hidden rounded-full"
                    style={{ background: 'var(--mzaya-surface-muted)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${((Number(item.qty) || 0) / maxItemQty) * 100}%`,
                        background: 'var(--mzaya-primary)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </main>
    </div>
  )
}

function Metric({ icon: Icon, label, value }) {
  return (
    <article
      className="rounded-[22px] border bg-white p-5"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-[14px]"
        style={{
          background: 'var(--mzaya-primary-soft)',
          color: 'var(--mzaya-primary)',
        }}
      >
        <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <p
        className="mt-5 text-[10px] font-semibold uppercase tracking-[0.13em]"
        style={{ color: 'var(--mzaya-text-muted)' }}
      >
        {label}
      </p>
      <p
        className="mt-2 text-[23px] font-semibold tracking-[-0.035em]"
        style={{ color: 'var(--mzaya-text-primary)' }}
      >
        {value}
      </p>
    </article>
  )
}

function ChartCard({ title, description, children, className = '' }) {
  return (
    <section
      className={`rounded-[24px] border bg-white p-5 sm:p-6 ${className}`}
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: 'var(--mzaya-shadow-sm)',
      }}
    >
      <h2
        className="text-[15px] font-semibold"
        style={{ color: 'var(--mzaya-text-primary)' }}
      >
        {title}
      </h2>
      <p
        className="mt-1 text-[10px]"
        style={{ color: 'var(--mzaya-text-muted)' }}
      >
        {description}
      </p>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function AxisLabels({ daily }) {
  if (!daily.length) return null
  return (
    <div
      className="mt-3 flex justify-between text-[9px]"
      style={{ color: 'var(--mzaya-text-muted)' }}
    >
      <span>{fmtDate(daily[0]?.date)}</span>
      <span>{fmtDate(daily[Math.floor(daily.length / 2)]?.date)}</span>
      <span>{fmtDate(daily[daily.length - 1]?.date)}</span>
    </div>
  )
}

function ChartEmpty({ message }) {
  return (
    <div
      className="flex h-40 items-center justify-center rounded-[18px]"
      style={{
        background: 'var(--mzaya-surface-muted)',
        color: 'var(--mzaya-text-muted)',
      }}
    >
      <p className="text-[12px]">{message}</p>
    </div>
  )
}

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-ZW', {
    day: 'numeric',
    month: 'short',
  })
}
