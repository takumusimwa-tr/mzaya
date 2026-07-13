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
  } catch (e) { /* audio not available */ }
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
      } catch (e) { /* denied or unsupported */ }
    }
    request()
    // Re-acquire if the page becomes visible again (lock drops on tab switch)
    const onVisible = () => { if (!released && document.visibilityState === 'visible') request() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      released = true
      document.removeEventListener('visibilitychange', onVisible)
      if (lock) { try { lock.release() } catch (e) {} }
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
  useSocketEvent('order:new', () => queryClient.invalidateQueries(['vendor-orders']), [])
  useSocketEvent('order:updated', () => queryClient.invalidateQueries(['vendor-orders']), [])

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
    onSuccess:  () => queryClient.invalidateQueries(['vendor-orders']),
  })

  // Vehicle tiers for the truck-upgrade control.
  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn:  () => api.get('/vehicles').then((r) => r.data.vehicles),
  })

  const upgradeVehicle = useMutation({
    mutationFn: ({ orderId, vehicle_type }) =>
      api.post(`/orders/${orderId}/upgrade-vehicle`, { vehicle_type }),
    onSuccess:  () => queryClient.invalidateQueries(['vendor-orders']),
  })

  const grouped = useMemo(() => {
    const g = { new: [], active: [], past: [] }
    for (const o of orders || []) {
      const found = GROUPS.find((grp) => grp.match(o))
      if (found) g[found.key].push(o)
    }
    return g
  }, [orders])

  const list = grouped[group] || []

  // Auto-select the first order in the current group if none selected / stale.
  useEffect(() => {
    if (!list.length) { setSelectedId(null); return }
    if (!selectedId || !list.some((o) => o.id === selectedId)) {
      setSelectedId(list[0].id)
    }
  }, [group, list, selectedId])

  const selected = (orders || []).find((o) => o.id === selectedId)

  if (isLoading) return <LoadingScreen message="Loading orders..." />

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar with group tabs */}
      <div className="px-6 pt-6 pb-3 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-black text-gray-900 mb-4">Orders</h1>
        <div className="flex gap-2">
          {GROUPS.map((grp) => {
            const count = grouped[grp.key].length
            const active = group === grp.key
            const isNew = grp.key === 'new' && count > 0
            return (
              <button key={grp.key} onClick={() => setGroup(grp.key)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                style={active
                  ? { background: '#00A651', color: '#fff' }
                  : { background: '#F3F4F6', color: '#4B5563' }
                }>
                {isNew && <span className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ color: active ? '#fff' : '#00A651' }} />}
                {grp.label}
                <span className="text-xs opacity-80">({count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Master-detail split */}
      <div className="flex-1 flex min-h-0">
        {/* Master: order list */}
        <div className="w-80 xl:w-96 shrink-0 border-r border-gray-200 overflow-y-auto bg-gray-50">
          {list.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No {GROUPS.find((g) => g.key === group)?.label.toLowerCase()} orders
            </div>
          ) : (
            <div className="p-3 flex flex-col gap-2">
              {list.map((o) => (
                <OrderListItem key={o.id} order={o}
                  selected={o.id === selectedId}
                  onClick={() => setSelectedId(o.id)} />
              ))}
            </div>
          )}
        </div>

        {/* Detail: selected order */}
        <div className="flex-1 min-w-0 overflow-y-auto bg-white">
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
            <div className="h-full flex items-center justify-center text-gray-300">
              <div className="text-center">
                <div className="mb-3 flex justify-center text-gray-300"><Icon name="orders" size={48} /></div>
                <p className="text-sm">Select an order to see details</p>
              </div>
            </div>
          )}
        </div>
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

function OrderListItem({ order, selected, onClick }) {
  const detail = orderDetail(order)
  const itemCount = detail?.items?.length || 0
  return (
    <button onClick={onClick}
      className="text-left rounded-2xl p-3 border transition-all"
      style={selected
        ? { background: '#fff', borderColor: '#00A651', boxShadow: '0 2px 8px rgba(255,48,8,0.10)' }
        : { background: '#fff', borderColor: '#E5E7EB' }
      }>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</span>
        <Badge label={order.status.replace('_', ' ')} type={order.status} />
      </div>
      <p className="text-sm text-gray-700 truncate">→ {order.dropoff_address}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-400">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
        <span className="text-sm font-bold text-gray-900">US${Number(order.subtotal_usd).toFixed(2)}</span>
      </div>
    </button>
  )
}

function OrderDetailPane({ order, onAccept, accepting, onChat, vehicles, onUpgrade, upgrading, upgradeResult, upgradeError }) {
  const detail = orderDetail(order)
  const placed = new Date(order.createdAt)

  return (
    <div className="p-6 max-w-2xl">
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
          <div className="mt-3 text-sm rounded-xl px-3 py-2" style={{ background: '#FEF9E7', color: '#8A6D1B' }}>
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
          <Row label="City" value={order.city} />
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
        className="w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-98 mb-3"
        style={{ background: '#EDFAF3', color: '#00A651' }}>
        <Icon name="chat" size={15} className="inline" /> Message customer & rider
      </button>

      {/* Action */}
      {order.status === 'pending' && (
        <button onClick={onAccept} disabled={accepting}
          className="w-full py-4 rounded-2xl text-white font-bold text-base active:scale-98 transition-transform disabled:opacity-50"
          style={{ background: '#00A651' }}>
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
          style={{ background: '#FFF4E5', color: '#B8860B' }}>
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
                  ? { borderColor: '#00A651', background: '#EDFAF3' }
                  : { borderColor: '#E5E7EB' }
                }>
                <span className="font-semibold text-gray-800">{v.name}</span>
                <span className="text-xs text-gray-400">{v.hint}</span>
              </button>
            ))}
          </div>
          {result && (
            <p className="text-xs mb-2" style={{ color: '#00A651' }}>{result.message}</p>
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
              style={{ background: '#00A651' }}>
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
