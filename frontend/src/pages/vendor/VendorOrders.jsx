/**
 * ============================================================================
 * MZAYA
 * Page: VendorOrders
 * Path: frontend/src/pages/vendor/VendorOrders.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Operates the branch-aware, real-time vendor order console.
 *
 * Preserved Integration
 * ---------------------
 * • GET /orders/vendor
 * • PATCH /orders/:id/status
 * • GET /vehicles
 * • POST /orders/:id/upgrade-vehicle
 * • Socket rooms and order:new / order:updated events
 * • 15-second polling fallback
 * • Wake Lock and Web Audio order alert behavior
 * • Existing OrderChat integration
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: refined master-detail presentation,
 * canonical order cards and React Query v5 invalidation syntax.
 * ============================================================================
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/api'
import useActiveBranch from '../../store/useActiveBranch'
import useSocketEvent from '../../hooks/useSocketEvent'
import { joinVendor, leaveVendor } from '../../realtime/socket'
import Badge from '../../components/ui/Badge'
import LoadingScreen from '../../components/ui/LoadingScreen'
import OrderChat from '../../components/OrderChat'
import Icon from '../../components/ui/Icon'
import { MessageCircle, PackageOpen } from 'lucide-react'
import VendorOrderCard from '../../components/vendor/VendorOrderCard'
import VendorEmptyState from '../../components/vendor/VendorEmptyState'

// Play a loud, distinct, repeating alert that cuts through a busy kitchen.
// Uses the Web Audio API (no asset needed) — three rising beeps, repeated twice.
function playNewOrderAlert() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime
    const notes = [660, 880, 1046, 660, 880, 1046]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = freq
      const t = now + i * 0.22
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.35, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
      osc.connect(gain); gain.connect(ctx.destination)
      osc.start(t); osc.stop(t + 0.2)
    })
    setTimeout(() => ctx.close(), 2000)
  } catch { /* audio not available */ }
}

// Keep the tablet screen awake while the console is open (kitchen display).
function useWakeLock() {
  useEffect(() => {
    let lock = null
    let released = false
    const request = async () => {
      try {
        if ('wakeLock' in navigator) {
          lock = await navigator.wakeLock.request('screen')
        }
      } catch { /* denied or unsupported */ }
    }
    request()
    // Re-acquire if the page becomes visible again (lock drops on tab switch)
    const onVisible = () => { if (!released && document.visibilityState === 'visible') request() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      released = true
      document.removeEventListener('visibilitychange', onVisible)
      if (lock) { try { lock.release() } catch { /* already released */ } }
    }
  }, [])
}

const GROUPS = [
  { key: 'new',    label: 'New',         match: (o) => o.status === 'pending' },
  { key: 'active', label: 'In progress', match: (o) => ['accepted', 'picked_up', 'en_route'].includes(o.status) },
  { key: 'past',   label: 'Completed',   match: (o) => ['delivered', 'cancelled'].includes(o.status) },
]

export default function VendorOrders() {
  const queryClient = useQueryClient()
  const branchId = useActiveBranch((s) => s.branchId)
  const [group, setGroup]       = useState('new')
  const [selectedId, setSelectedId] = useState(null)
  const [chatOrderId, setChatOrderId] = useState(null)
  const prevPending = useRef(null)

  useWakeLock()

  const { data: orders, isLoading } = useQuery({
    queryKey: ['vendor-orders', branchId],
    queryFn:  () => api.get('/orders/vendor', { params: branchId ? { branch_id: branchId } : {} }).then((r) => r.data.orders),
    refetchInterval: 15000, // fallback; real-time drives most updates
  })

  // Resolve the active branch id to join its real-time room.
  const { data: vendorData } = useQuery({
    queryKey: ['my-vendor', branchId],
    queryFn:  () => api.get('/vendors/my', { params: branchId ? { branch_id: branchId } : {} }).then((r) => r.data.vendor),
  })
  const vendorId = vendorData?.id

  useEffect(() => {
    if (!vendorId) return
    joinVendor(vendorId)
    return () => leaveVendor(vendorId)
  }, [vendorId])

  // Real-time: refetch orders when this branch gets a new/updated order.
  useSocketEvent('order:new', () => queryClient.invalidateQueries({ queryKey: ['vendor-orders'] }), [])
  useSocketEvent('order:updated', () => queryClient.invalidateQueries({ queryKey: ['vendor-orders'] }), [])

  // Loud alert when the pending count rises.
  useEffect(() => {
    if (!orders) return
    const pendingCount = orders.filter((o) => o.status === 'pending').length
    if (prevPending.current !== null && pendingCount > prevPending.current) {
      playNewOrderAlert()
    }
    prevPending.current = pendingCount
  }, [orders])

  const acceptOrder = useMutation({
    mutationFn: (orderId) => api.patch(`/orders/${orderId}/status`, { status: 'accepted' }),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['vendor-orders'] }),
  })

  // Vehicle tiers for the truck-upgrade control.
  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn:  () => api.get('/vehicles').then((r) => r.data.vehicles),
  })

  const upgradeVehicle = useMutation({
    mutationFn: ({ orderId, vehicle_type }) =>
      api.post(`/orders/${orderId}/upgrade-vehicle`, { vehicle_type }),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['vendor-orders'] }),
  })

  const grouped = useMemo(() => {
    const g = { new: [], active: [], past: [] }
    for (const o of orders || []) {
      const found = GROUPS.find((grp) => grp.match(o))
      if (found) g[found.key].push(o)
    }
    return g
  }, [orders])

  const list = useMemo(() => grouped[group] || [], [grouped, group])

  // Auto-select the first order in the current group if none selected / stale.
  useEffect(() => {
    // Keep a valid selection as the list changes — legitimate state sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!list.length) { setSelectedId(null); return }
    if (!selectedId || !list.some((o) => o.id === selectedId)) {
      setSelectedId(list[0].id)
    }
  }, [group, list, selectedId])

  const selected = (orders || []).find((o) => o.id === selectedId)

  if (isLoading) return <LoadingScreen message="Loading orders..." />

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--mzaya-background)' }}>
      <header className="px-5 pt-7 pb-4 sm:px-8 bg-white border-b" style={{ borderColor: 'var(--mzaya-border)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--mzaya-primary)' }}>Operations</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.04em]" style={{ color: 'var(--mzaya-text-primary)' }}>Orders</h1>
        <p className="mt-2 text-[12px]" style={{ color: 'var(--mzaya-text-muted)' }}>Review, accept and manage live branch orders.</p>
        <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar">
          {GROUPS.map((grp) => {
            const count = grouped[grp.key].length
            const active = group === grp.key
            const isNew = grp.key === 'new' && count > 0
            return (
              <button key={grp.key} type="button" onClick={() => setGroup(grp.key)}
                className="flex items-center gap-2 whitespace-nowrap rounded-[13px] px-4 py-2.5 text-[11px] font-semibold outline-none transition focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                style={{
                  background: active ? 'var(--mzaya-primary)' : 'var(--mzaya-surface-muted)',
                  color: active ? '#fff' : 'var(--mzaya-text-secondary)',
                }}>
                {isNew && <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: active ? '#fff' : 'var(--mzaya-primary)' }} />}
                {grp.label}
                <span className="text-xs opacity-80">({count})</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <aside className="w-[340px] xl:w-[390px] shrink-0 border-r overflow-y-auto p-3 sm:p-4" style={{ borderColor: 'var(--mzaya-border)', background: 'var(--mzaya-background)' }} aria-label="Order list">
          {list.length === 0 ? (
            <VendorEmptyState
              icon={PackageOpen}
              title={`No ${GROUPS.find((g) => g.key === group)?.label.toLowerCase()} orders`}
              message="Orders in this stage will appear here automatically."
              compact
            />
          ) : (
            <div className="flex flex-col gap-3">
              {list.map((order) => (
                <VendorOrderCard
                  key={order.id}
                  order={order}
                  selected={order.id === selectedId}
                  onSelect={(selectedOrder) => setSelectedId(selectedOrder.id)}
                />
              ))}
            </div>
          )}
        </aside>

        <section className="flex-1 min-w-0 overflow-y-auto bg-white" aria-label="Selected order details">
          {selected ? (
            <OrderDetailPane order={selected}
              onChat={() => setChatOrderId(selected.id)}
              onAccept={() => acceptOrder.mutate(selected.id)}
              accepting={acceptOrder.isPending}
              vehicles={vehicles}
              onUpgrade={(vehicle_type) => upgradeVehicle.mutate({ orderId: selected.id, vehicle_type })}
              upgrading={upgradeVehicle.isPending}
              upgradeResult={upgradeVehicle.data}
              upgradeError={upgradeVehicle.error} />
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <VendorEmptyState
                icon={PackageOpen}
                title="Select an order"
                message="Choose an order from the list to review its details."
                compact
              />
            </div>
          )}
        </section>
      </div>

      {/* Chat sheet */}
      {chatOrderId && (
        <OrderChat orderId={chatOrderId} onClose={() => setChatOrderId(null)} />
      )}
    </div>
  )
}

function orderDetail(order) {
  return order.foodDetail || order.groceryDetail || order.materialsDetail || order.errandDetail
}

function OrderDetailPane({ order, onAccept, accepting, onChat, vehicles, onUpgrade, upgrading, upgradeResult, upgradeError }) {
  const detail = orderDetail(order)
  const placed = new Date(order.createdAt)

  return (
    <div className="mx-auto max-w-3xl p-5 sm:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-mono text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</p>
          <h2 className="text-xl font-black text-gray-900 mt-1 capitalize">{order.category_type} order</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Placed {placed.toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' })}
            {order.scheduled_for && ` · scheduled for ${new Date(order.scheduled_for).toLocaleString('en-ZW', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}`}
          </p>
        </div>
        <Badge label={order.status.replace('_', ' ')} type={order.status} />
      </div>

      {/* Items */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Items</h3>
        <div className="rounded-2xl border border-gray-100 divide-y divide-gray-100">
          {detail?.items?.length ? detail.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-800">{item.name}</span>
              <span className="text-sm text-gray-500">× {item.qty}</span>
            </div>
          )) : (
            <div className="px-4 py-3 text-sm text-gray-400">No item details</div>
          )}
        </div>
        {detail?.special_instructions && (
          <div className="mt-3 text-sm rounded-xl px-3 py-2" style={{ background: 'var(--mzaya-warning-soft)', color: 'var(--mzaya-warning-text)' }}>
            <Icon name="note" size={12} className="inline" /> {detail.special_instructions}
          </div>
        )}
      </div>

      {/* Delivery */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Delivery</h3>
        <div className="rounded-2xl border border-gray-100 p-4 flex flex-col gap-2">
          <Row label="Drop-off" value={order.dropoff_address} />
          {order.dropoff_landmark && <Row label="Landmark" value={order.dropoff_landmark} />}
          {order.vehicle_type && <Row label="Vehicle" value={order.vehicle_type.replace('_', ' ')} />}
          <Row label="City" value={order.city ? order.city.charAt(0).toUpperCase() + order.city.slice(1) : '—'} />
        </div>
      </div>

      {/* Payment */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Payment</h3>
        <div className="rounded-2xl border border-gray-100 p-4 flex flex-col gap-2">
          <Row label="Subtotal" value={`$${Number(order.subtotal_usd).toFixed(2)}`} />
          <Row label="Delivery fee" value={`$${Number(order.delivery_fee_usd).toFixed(2)}`} />
          {Number(order.tip_usd) > 0 && <Row label="Tip" value={`$${Number(order.tip_usd).toFixed(2)}`} />}
          {Number(order.discount_usd) > 0 && <Row label="Discount" value={`−$${Number(order.discount_usd).toFixed(2)}`} />}
          <div className="border-t border-gray-100 pt-2 mt-1">
            <Row label="Total" value={`$${Number(order.total_usd).toFixed(2)}`} bold />
          </div>
          <Row label="Method" value={order.payment_method} />
        </div>
      </div>

      {/* Message the customer & rider */}
      <button onClick={onChat}
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-[16px] py-3 text-[12px] font-semibold outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
        style={{ background: 'var(--mzaya-primary-soft)', color: 'var(--mzaya-primary)' }}>
        <Icon name="chat" size={15} className="inline" /> Message customer & Mzaya
      </button>

      {/* Action */}
      {order.status === 'pending' && (
        <button onClick={onAccept} disabled={accepting}
          className="w-full rounded-[16px] py-4 text-[13px] font-semibold text-white outline-none transition disabled:opacity-50 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
          style={{ background: 'var(--mzaya-primary)' }}>
          {accepting ? 'Accepting…' : 'Accept order'}
        </button>
      )}

      {/* Truck upgrade — materials/grocery, before pickup */}
      {['materials', 'grocery'].includes(order.category_type)
        && ['pending', 'accepted'].includes(order.status) && (
        <VehicleUpgrade
          order={order}
          vehicles={vehicles}
          onUpgrade={onUpgrade}
          upgrading={upgrading}
          result={upgradeResult}
          error={upgradeError}
        />
      )}
    </div>
  )
}

// Lets the vendor bump an order to a bigger vehicle if the load is bulkier than
// the weight suggested. Only offers tiers larger than the current one.
function VehicleUpgrade({ order, vehicles, onUpgrade, upgrading, result, error }) {
  const [open, setOpen] = useState(false)
  const [pick, setPick] = useState('')

  const currentRank = vehicles?.find((v) => v.value === order.vehicle_type)?.rank ?? 0
  const larger = (vehicles || []).filter((v) => v.rank > currentRank)

  if (!larger.length) return null

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {!open ? (
        <button onClick={() => setOpen(true)}
          className="text-sm font-semibold px-4 py-2.5 rounded-xl"
          style={{ background: 'var(--mzaya-warning-soft)', color: 'var(--mzaya-warning-text)' }}>
          <Icon name="vehicle" size={15} className="inline" /> Needs a bigger vehicle?
        </button>
      ) : (
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-bold text-gray-700 mb-1">Request a bigger vehicle</p>
          <p className="text-xs text-gray-400 mb-3">
            Currently assigned: {vehicles?.find((v) => v.value === order.vehicle_type)?.name || order.vehicle_type}.
            The delivery fee will update.
          </p>
          <div className="flex flex-col gap-2 mb-3">
            {larger.map((v) => (
              <button key={v.value} onClick={() => setPick(v.value)}
                className="flex items-center justify-between p-2.5 rounded-lg border text-left text-sm transition-all"
                style={pick === v.value
                  ? { borderColor: 'var(--mzaya-primary)', background: 'var(--mzaya-primary-soft)' }
                  : { borderColor: '#E5E7EB' }
                }>
                <span className="font-semibold text-gray-800">{v.name}</span>
                <span className="text-xs text-gray-400">{v.hint}</span>
              </button>
            ))}
          </div>
          {result && (
            <p className="text-xs mb-2" style={{ color: 'var(--mzaya-primary)' }}>{result.message}</p>
          )}
          {error && (
            <p className="text-xs mb-2 text-red-500">{error.response?.data?.error || 'Upgrade failed'}</p>
          )}
          <div className="flex gap-2">
            <button onClick={() => { setOpen(false); setPick('') }}
              className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-600 text-sm font-semibold">
              Cancel
            </button>
            <button onClick={() => pick && onUpgrade(pick)} disabled={!pick || upgrading}
              className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
              style={{ background: 'var(--mzaya-primary)' }}>
              {upgrading ? 'Upgrading…' : 'Confirm upgrade'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm capitalize ${bold ? 'font-black text-gray-900' : 'text-gray-700'}`}>{value}</span>
    </div>
  )
}
