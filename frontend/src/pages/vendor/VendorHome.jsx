/**
 * ============================================================================
 * MZAYA — VendorHome
 * Path: frontend/src/pages/vendor/VendorHome.jsx
 * ----------------------------------------------------------------------------
 * Purpose
 * -------
 * Operational home dashboard for an authenticated Mzaya vendor branch.
 *
 * Responsibilities
 * ----------------
 * • Preserve current vendor and order queries for the selected branch.
 * • Preserve new-order polling and browser-notification behavior.
 * • Preserve the existing pause/resume mutation and cache invalidation.
 * • Present operational metrics, urgent orders, menu preview and recent orders.
 * • Route users into the established orders, menu and analytics screens.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not create, accept, reject or fulfil orders.
 * • Does not calculate accounting revenue beyond the existing delivered-order
 *   subtotal summary already used by this dashboard.
 * • Does not modify menu items or branch settings.
 * • Does not introduce new backend endpoints or payload fields.
 *
 * Data Contracts
 * --------------
 * GET /vendors/my?branch_id=...
 * GET /orders/vendor?branch_id=...
 * PUT /vendors/:id { is_paused }
 * Existing query keys are preserved for compatibility with sibling pages.
 *
 * Accessibility
 * -------------
 * Uses semantic headings, labelled controls, visible focus states, descriptive
 * image alternatives and non-colour status text.
 *
 * Change Log
 * ----------
 * July 2026 — Premium brand refinement; operational behavior preserved.
 * ============================================================================
 */

import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  ListOrdered,
  Pause,
  Play,
  Store,
  UtensilsCrossed,
} from 'lucide-react'
import api from '../../api/api'
import useActiveBranch from '../../store/useActiveBranch'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Badge from '../../components/ui/Badge'
import { sendNotification } from '../../hooks/useNotifications'
import imageUrl from '../../utils/imageUrl'
import VendorMetricCard from '../../components/vendor/VendorMetricCard'
import VendorSectionCard from '../../components/vendor/VendorSectionCard'

const ACTIVE_ORDER_STATUSES = ['accepted', 'picked_up', 'en_route']

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
}

function formatOrderTime(value) {
  if (!value) return 'Time unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Time unavailable'

  return date.toLocaleTimeString('en-ZW', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function shortOrderReference(order) {
  const value = order?.id
  return value ? `#${String(value).slice(0, 8).toUpperCase()}` : 'Order'
}

export default function VendorHome() {
  const branchId = useActiveBranch((state) => state.branchId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const previousPendingCount = useRef(0)

  const {
    data: vendorData,
    isLoading: vendorLoading,
    isError: vendorError,
    refetch: refetchVendor,
  } = useQuery({
    queryKey: ['my-vendor', branchId],
    queryFn: () =>
      api
        .get('/vendors/my', {
          params: branchId ? { branch_id: branchId } : {},
        })
        .then((response) => response.data.vendor),
  })

  const {
    data: orders = [],
    isLoading: ordersLoading,
    isError: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['vendor-orders', branchId],
    queryFn: () =>
      api
        .get('/orders/vendor', {
          params: branchId ? { branch_id: branchId } : {},
        })
        .then((response) => response.data.orders),
    refetchInterval: 15000,
  })

  const pendingOrders = orders.filter((order) => order.status === 'pending')

  useEffect(() => {
    if (pendingOrders.length > previousPendingCount.current) {
      sendNotification(
        'New Mzaya order',
        `${pendingOrders.length} new order${pendingOrders.length === 1 ? '' : 's'} waiting`,
        () => navigate('/vendor/orders')
      )
    }
    previousPendingCount.current = pendingOrders.length
  }, [navigate, pendingOrders.length])

  useEffect(() => {
    if (
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission().catch(() => {})
    }
  }, [])

  const togglePause = useMutation({
    mutationFn: () =>
      api.put(`/vendors/${vendorData?.id}`, {
        is_paused: !vendorData?.is_paused,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['my-vendor'] }),
  })

  if (vendorLoading) return <LoadingScreen message="Loading vendor dashboard..." />

  if (vendorError || !vendorData) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <section
          className="w-full max-w-lg rounded-[26px] border bg-white p-8 text-center"
          style={{
            borderColor: 'var(--mzaya-border)',
            boxShadow: 'var(--mzaya-shadow-md)',
          }}
        >
          <Store
            className="mx-auto"
            size={28}
            strokeWidth={1.8}
            style={{ color: 'var(--mzaya-green-700)' }}
            aria-hidden="true"
          />
          <h1
            className="mt-5 text-[22px] font-semibold tracking-[-0.03em]"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            Dashboard unavailable
          </h1>
          <p
            className="mt-2 text-[13px] leading-6"
            style={{ color: 'var(--mzaya-text-secondary)' }}
          >
            We could not load this vendor branch. Check your connection and try
            again.
          </p>
          <button
            type="button"
            onClick={() => refetchVendor()}
            className="mt-6 rounded-[14px] px-5 py-3 text-[12px] font-semibold text-white outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{ background: 'var(--mzaya-green-700)' }}
          >
            Try again
          </button>
        </section>
      </main>
    )
  }

  const activeOrders = orders.filter((order) =>
    ACTIVE_ORDER_STATUSES.includes(order.status)
  )
  const deliveredOrders = orders.filter(
    (order) => order.status === 'delivered'
  )
  const revenue = deliveredOrders.reduce(
    (sum, order) => sum + Number(order.subtotal_usd || 0),
    0
  )
  const menuItems = vendorData.menuItems || []
  const isAcceptingOrders = vendorData.is_open && !vendorData.is_paused

  return (
    <main
      className="h-screen overflow-y-auto"
      style={{ background: 'var(--mzaya-surface-subtle)' }}
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 pb-12 pt-7 sm:px-8 lg:px-10">
        <header
          className="overflow-hidden rounded-[28px] border bg-white"
          style={{
            borderColor: 'var(--mzaya-border)',
            boxShadow: 'var(--mzaya-shadow-sm)',
          }}
        >
          <div className="flex flex-col gap-6 p-6 sm:p-7 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[20px] text-[24px] font-semibold"
                style={{
                  background: 'var(--mzaya-green-50)',
                  color: 'var(--mzaya-green-800)',
                }}
              >
                {vendorData.logo_url ? (
                  <img
                    src={imageUrl(vendorData.logo_url, 180)}
                    alt={`${vendorData.name} logo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  vendorData.name?.charAt(0)?.toUpperCase() || 'V'
                )}
              </div>

              <div className="min-w-0">
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: 'var(--mzaya-green-700)' }}
                >
                  Vendor overview
                </p>
                <h1
                  className="mt-1 truncate text-[26px] font-semibold tracking-[-0.04em] sm:text-[30px]"
                  style={{ color: 'var(--mzaya-text-primary)' }}
                >
                  {vendorData.name}
                </h1>
                <div
                  className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]"
                  style={{ color: 'var(--mzaya-text-secondary)' }}
                >
                  {vendorData.address ? <span>{vendorData.address}</span> : null}
                  {vendorData.address && vendorData.category ? (
                    <span aria-hidden="true">•</span>
                  ) : null}
                  {vendorData.category ? (
                    <span className="capitalize">{vendorData.category}</span>
                  ) : null}
                  <span aria-hidden="true">•</span>
                  <span>Rating {Number(vendorData.rating || 0).toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className="inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-[11px] font-semibold"
                style={{
                  borderColor: isAcceptingOrders
                    ? 'var(--mzaya-green-200)'
                    : 'var(--mzaya-border)',
                  background: isAcceptingOrders
                    ? 'var(--mzaya-green-50)'
                    : 'var(--mzaya-surface-subtle)',
                  color: isAcceptingOrders
                    ? 'var(--mzaya-green-800)'
                    : 'var(--mzaya-text-secondary)',
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: isAcceptingOrders
                      ? 'var(--mzaya-green-600)'
                      : '#98A2B3',
                  }}
                  aria-hidden="true"
                />
                {isAcceptingOrders ? 'Accepting orders' : 'Not accepting orders'}
              </span>

              <button
                type="button"
                onClick={() => togglePause.mutate()}
                disabled={togglePause.isPending}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-[11px] font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                style={{
                  borderColor: vendorData.is_paused
                    ? 'var(--mzaya-green-300)'
                    : 'var(--mzaya-border)',
                  background: vendorData.is_paused
                    ? 'var(--mzaya-green-700)'
                    : 'white',
                  color: vendorData.is_paused
                    ? 'white'
                    : 'var(--mzaya-text-primary)',
                }}
              >
                {vendorData.is_paused ? (
                  <Play size={16} strokeWidth={1.8} aria-hidden="true" />
                ) : (
                  <Pause size={16} strokeWidth={1.8} aria-hidden="true" />
                )}
                {togglePause.isPending
                  ? 'Updating...'
                  : vendorData.is_paused
                    ? 'Resume orders'
                    : 'Pause orders'}
              </button>
            </div>
          </div>
        </header>

        {pendingOrders.length > 0 ? (
          <button
            type="button"
            onClick={() => navigate('/vendor/orders')}
            className="mt-5 flex w-full items-center justify-between gap-4 rounded-[22px] px-5 py-4 text-left text-white outline-none transition hover:-translate-y-0.5 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{
              background:
                'linear-gradient(135deg, var(--mzaya-green-800), var(--mzaya-green-600))',
              boxShadow: '0 12px 30px rgba(0, 125, 61, 0.2)',
            }}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white/12">
                <BellRing size={19} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold">
                  {pendingOrders.length} new order
                  {pendingOrders.length === 1 ? '' : 's'} waiting
                </span>
                <span className="mt-0.5 block text-[11px] text-white/75">
                  Review and respond from the orders workspace.
                </span>
              </span>
            </span>
            <ArrowRight size={19} strokeWidth={1.8} aria-hidden="true" />
          </button>
        ) : null}

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Vendor summary">
          <VendorMetricCard
            label="New orders"
            value={pendingOrders.length}
            note="Awaiting your response"
            icon={BellRing}
            emphasis={pendingOrders.length > 0 ? 'primary' : 'default'}
          />
          <VendorMetricCard
            label="Active orders"
            value={activeOrders.length}
            note="Being prepared or delivered"
            icon={Clock3}
          />
          <VendorMetricCard
            label="Completed"
            value={deliveredOrders.length}
            note="Delivered in current results"
            icon={CheckCircle2}
          />
          <VendorMetricCard
            label="Revenue"
            value={formatCurrency(revenue)}
            note="Delivered-order subtotals"
            icon={CircleDollarSign}
            emphasis="primary"
          />
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
          <VendorSectionCard
            title="Recent orders"
            description="Latest activity for the selected branch."
            action={
              <button
                type="button"
                onClick={() => navigate('/vendor/orders')}
                className="inline-flex items-center gap-1.5 rounded-[11px] px-3 py-2 text-[11px] font-semibold outline-none hover:bg-gray-50 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                style={{ color: 'var(--mzaya-green-800)' }}
              >
                View all
                <ArrowRight size={14} strokeWidth={1.8} aria-hidden="true" />
              </button>
            }
            bodyClassName="p-0 sm:p-0"
          >
            {ordersLoading ? (
              <div className="space-y-3 p-5 sm:p-6" aria-label="Loading recent orders">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-20 animate-pulse rounded-[16px]"
                    style={{ background: 'var(--mzaya-surface-subtle)' }}
                  />
                ))}
              </div>
            ) : ordersError ? (
              <div className="p-6 text-center">
                <p
                  className="text-[12px]"
                  style={{ color: 'var(--mzaya-text-secondary)' }}
                >
                  Recent orders could not be loaded.
                </p>
                <button
                  type="button"
                  onClick={() => refetchOrders()}
                  className="mt-3 rounded-[12px] px-4 py-2 text-[11px] font-semibold outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                  style={{
                    background: 'var(--mzaya-green-50)',
                    color: 'var(--mzaya-green-800)',
                  }}
                >
                  Try again
                </button>
              </div>
            ) : orders.length > 0 ? (
              <div className="divide-y" style={{ borderColor: 'var(--mzaya-border)' }}>
                {orders.slice(0, 6).map((order) => (
                  <article
                    key={order.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className="font-mono text-[10px] font-semibold"
                          style={{ color: 'var(--mzaya-text-secondary)' }}
                        >
                          {shortOrderReference(order)}
                        </p>
                        <Badge
                          label={String(order.status || 'unknown').replaceAll('_', ' ')}
                          type={order.status}
                        />
                      </div>
                      <p
                        className="mt-2 truncate text-[12px] font-semibold"
                        style={{ color: 'var(--mzaya-text-primary)' }}
                      >
                        {order.dropoff_address || 'Delivery address unavailable'}
                      </p>
                      <p
                        className="mt-1 text-[10px]"
                        style={{ color: 'var(--mzaya-text-secondary)' }}
                      >
                        {formatOrderTime(order.createdAt)}
                      </p>
                    </div>
                    <p
                      className="shrink-0 text-[13px] font-semibold"
                      style={{ color: 'var(--mzaya-text-primary)' }}
                    >
                      {formatCurrency(order.subtotal_usd)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <ListOrdered
                  className="mx-auto"
                  size={24}
                  strokeWidth={1.8}
                  style={{ color: 'var(--mzaya-green-700)' }}
                  aria-hidden="true"
                />
                <p
                  className="mt-3 text-[13px] font-semibold"
                  style={{ color: 'var(--mzaya-text-primary)' }}
                >
                  No orders yet
                </p>
                <p
                  className="mt-1 text-[11px]"
                  style={{ color: 'var(--mzaya-text-secondary)' }}
                >
                  New branch orders will appear here.
                </p>
              </div>
            )}
          </VendorSectionCard>

          <div className="grid gap-5">
            <VendorSectionCard
              title="Quick actions"
              description="Move directly into daily operations."
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {[
                  {
                    label: 'Manage orders',
                    description: `${pendingOrders.length + activeOrders.length} currently active`,
                    icon: ListOrdered,
                    path: '/vendor/orders',
                  },
                  {
                    label: 'Manage menu',
                    description: `${menuItems.length} item${menuItems.length === 1 ? '' : 's'} listed`,
                    icon: UtensilsCrossed,
                    path: '/vendor/menu',
                  },
                ].map(({ label, description, icon: ActionIcon, path }) => (
                  <button
                    key={path}
                    type="button"
                    onClick={() => navigate(path)}
                    className="flex items-center gap-3 rounded-[17px] border p-4 text-left outline-none transition hover:-translate-y-0.5 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                    style={{ borderColor: 'var(--mzaya-border)' }}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px]"
                      style={{
                        background: 'var(--mzaya-green-50)',
                        color: 'var(--mzaya-green-800)',
                      }}
                    >
                      <ActionIcon size={18} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className="block text-[12px] font-semibold"
                        style={{ color: 'var(--mzaya-text-primary)' }}
                      >
                        {label}
                      </span>
                      <span
                        className="mt-1 block text-[10px]"
                        style={{ color: 'var(--mzaya-text-secondary)' }}
                      >
                        {description}
                      </span>
                    </span>
                    <ArrowRight
                      size={16}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      style={{ color: 'var(--mzaya-text-secondary)' }}
                    />
                  </button>
                ))}
              </div>
            </VendorSectionCard>

            <VendorSectionCard
              title="Menu preview"
              description="A quick view of currently returned menu items."
              action={
                <button
                  type="button"
                  onClick={() => navigate('/vendor/menu')}
                  className="rounded-[11px] px-3 py-2 text-[11px] font-semibold outline-none hover:bg-gray-50 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                  style={{ color: 'var(--mzaya-green-800)' }}
                >
                  Edit menu
                </button>
              }
            >
              {menuItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {menuItems.slice(0, 4).map((item) => (
                    <article key={item.id} className="min-w-0">
                      <div
                        className="aspect-[4/3] overflow-hidden rounded-[15px]"
                        style={{ background: 'var(--mzaya-green-50)' }}
                      >
                        {item.image_url ? (
                          <img
                            src={imageUrl(item.image_url, 300)}
                            alt={item.name || 'Menu item'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className="flex h-full items-center justify-center"
                            style={{ color: 'var(--mzaya-green-700)' }}
                          >
                            <UtensilsCrossed size={22} strokeWidth={1.6} aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <p
                        className="mt-2 truncate text-[11px] font-semibold"
                        style={{ color: 'var(--mzaya-text-primary)' }}
                      >
                        {item.name}
                      </p>
                      <p
                        className="mt-0.5 text-[10px] font-semibold"
                        style={{ color: 'var(--mzaya-green-800)' }}
                      >
                        {formatCurrency(item.price_usd)}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <UtensilsCrossed
                    className="mx-auto"
                    size={23}
                    strokeWidth={1.8}
                    style={{ color: 'var(--mzaya-green-700)' }}
                    aria-hidden="true"
                  />
                  <p
                    className="mt-3 text-[12px] font-semibold"
                    style={{ color: 'var(--mzaya-text-primary)' }}
                  >
                    No menu items
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/vendor/menu')}
                    className="mt-3 rounded-[12px] px-4 py-2 text-[11px] font-semibold outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                    style={{
                      background: 'var(--mzaya-green-50)',
                      color: 'var(--mzaya-green-800)',
                    }}
                  >
                    Open menu manager
                  </button>
                </div>
              )}
            </VendorSectionCard>
          </div>
        </div>
      </div>
    </main>
  )
}
