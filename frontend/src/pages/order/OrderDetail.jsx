import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Camera, Check, MapPin, MessageCircle, Phone, RotateCcw, Star, Store, X,
} from 'lucide-react'
import api, { chatAPI, negotiationAPI, orderAPI, paymentAPI } from '../../api/api'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Money from '../../components/ui/Money'
import PaymentPanel from '../../components/PaymentPanel'
import OrderChat from '../../components/OrderChat'
import useReorder from '../../hooks/useReorder'
import useSocketEvent from '../../hooks/useSocketEvent'
import imageUrl from '../../utils/imageUrl'
import illoSearching from '../../assets/brand/illustrations/status/mzaya-searching-rider.svg'
import illoConfirmed from '../../assets/brand/illustrations/status/mzaya-order-confirmed.svg'
import illoCompleted from '../../assets/brand/illustrations/status/mzaya-order-completed.svg'

const T = {
  green: '#00A651', greenDeep: '#0B4A3F', greenTint: '#E9F7EF',
  ink: '#16191A', ink2: '#5F6B66', ink3: '#8C9692', line: '#ECEFED', fill: '#F4F6F5',
  red: '#C0392B', amber: '#9A6200', amberTint: '#FFF6E6',
}

const STAGES = [
  { key: 'pending', label: 'Placed' },
  { key: 'accepted', label: 'Mzaya assigned' },
  { key: 'picked_up', label: 'Picked up' },
  { key: 'en_route', label: 'On the way' },
  { key: 'delivered', label: 'Delivered' },
]
const LIVE = ['accepted', 'picked_up', 'en_route']

// One plain sentence per stage. No invented ETAs: the old screens showed fixed
// "5-10 min" style times that had nothing to do with the actual order.
function headline(order) {
  const store = order.foodDetail?.restaurant_name || order.groceryDetail?.store_name || order.materialsDetail?.supplier_name
  switch (order.status) {
    case 'scheduled':
      return {
        title: 'Order scheduled',
        sub: order.scheduled_for
          ? `We'll send a Mzaya for ${new Date(order.scheduled_for).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
          : 'We will send a Mzaya close to your chosen time',
      }
    case 'pending':
      return order.is_negotiable && !order.rider_id
        ? { title: 'Waiting for offers', sub: 'Nearby Mzayas are looking at your fare' }
        : { title: 'Finding a Mzaya', sub: 'Matching your order with someone nearby' }
    case 'accepted':
      return { title: 'A Mzaya is on it', sub: store ? `Heading to ${store} to collect your order` : 'Heading to collect your order' }
    case 'picked_up': return { title: 'Order picked up', sub: 'Your Mzaya has your order' }
    case 'en_route': return { title: 'On the way to you', sub: 'Your Mzaya is heading to your address' }
    case 'delivered': return { title: 'Delivered', sub: 'Enjoy, and thanks for ordering with Mzaya' }
    case 'failed': return { title: 'Order could not be completed', sub: order.cancel_reason || 'Please contact support if you were charged' }
    default: return { title: 'Order cancelled', sub: order.cancel_reason || 'This order was cancelled' }
  }
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const reorder = useReorder()
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['order', id] })

  const [showChat, setShowChat] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [liveLoc, setLiveLoc] = useState(null)

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderAPI.getOrder(id).then((r) => r.data.order),
    refetchInterval: 20000, // fallback; sockets drive updates
  })

  useSocketEvent('order:status_changed', (p) => { if (p?.orderId === id) refresh() }, [id])

  const live = !!order && LIVE.includes(order.status)

  // Mzaya location: pushed live over the socket; the poll is only a fallback.
  const { data: polledLoc } = useQuery({
    queryKey: ['rider-location', id],
    queryFn: () => api.get(`/riders/location/${id}`).then((r) => r.data.location),
    refetchInterval: 20000,
    enabled: live,
  })
  useSocketEvent('rider:location', (p) => {
    if (p?.orderId === id && Number.isFinite(p.lat)) setLiveLoc({ lat: p.lat, lng: p.lng })
  }, [id])
  const riderLoc = liveLoc || polledLoc || null

  const { data: contactData } = useQuery({
    queryKey: ['order-contacts', id],
    queryFn: () => chatAPI.contacts(id).then((r) => r.data),
    enabled: !!order?.rider_id && live,
  })
  const mzaya = contactData?.contacts?.find((c) => c.role === 'rider')

  // Fare negotiation: incoming offers for negotiable, unassigned orders.
  const awaitingOffers = order?.is_negotiable && !order?.rider_id && order?.status === 'pending'
  const { data: offers } = useQuery({
    queryKey: ['order-offers', id],
    queryFn: () => negotiationAPI.offers(id).then((r) => r.data.offers),
    enabled: !!awaitingOffers,
    refetchInterval: awaitingOffers ? 15000 : false,
  })
  useSocketEvent('offer:new', (p) => {
    if (p?.orderId === id) queryClient.invalidateQueries({ queryKey: ['order-offers', id] })
  }, [id])
  const chooseOffer = useMutation({
    mutationFn: (offerId) => negotiationAPI.chooseOffer(id, offerId),
    onSuccess: () => { refresh(); queryClient.invalidateQueries({ queryKey: ['order-offers', id] }) },
  })

  // Back from a Paynow (or mock) card redirect: poll to confirm the payment.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('mockpay') || params.get('paynow')) {
      paymentAPI.poll(id).finally(() => {
        queryClient.invalidateQueries({ queryKey: ['order', id] })
        window.history.replaceState({}, '', `/orders/${id}`)
      })
    }
  }, [id, queryClient])

  const cancelMutation = useMutation({
    mutationFn: () => orderAPI.cancel(id, 'Cancelled by customer'),
    onSuccess: () => { setConfirmCancel(false); refresh() },
  })

  if (isLoading) return <LoadingScreen message="Loading your order..." />
  if (!order) return <div className="p-6 text-center" style={{ color: T.ink2 }}>We couldn&apos;t find this order.</div>

  const detail = order.foodDetail || order.groceryDetail || order.materialsDetail || order.errandDetail
  const store = order.foodDetail?.restaurant_name || order.groceryDetail?.store_name || order.materialsDetail?.supplier_name
  const ended = ['cancelled', 'failed'].includes(order.status)
  const delivered = order.status === 'delivered'
  const unpaid = order.payment_status !== 'success'
  const stageIdx = STAGES.findIndex((s) => s.key === order.status)
  const head = headline(order)

  return (
    <main className="min-h-screen bg-white pb-16" style={{ color: T.ink }}>
      <header className="sticky top-0 z-[1001] flex items-center gap-1 bg-white/95 px-2 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <button type="button" aria-label="Back" onClick={() => navigate(-1)} className="flex h-11 w-11 items-center justify-center rounded-full active:bg-black/5">
          <ArrowLeft size={21} strokeWidth={2.2} />
        </button>
        <div className="flex h-14 min-w-0 flex-1 flex-col justify-center">
          <h1 className="truncate text-[17px] font-extrabold leading-tight">{store || 'Your order'}</h1>
          <p className="text-[12px]" style={{ color: T.ink3 }}>Order #{order.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </header>

      {/* ── Hero: live map while a Mzaya is moving, illustration otherwise ─── */}
      {live ? (
        <LiveMap rider={riderLoc} dropoff={order.dropoff_location} />
      ) : !ended && (
        <div className="flex h-[180px] items-center justify-center" style={{ background: T.greenTint }}>
          <img src={delivered ? illoCompleted : order.status === 'scheduled' ? illoConfirmed : illoSearching}
            alt="" aria-hidden="true" draggable="false" className="h-[150px] select-none" />
        </div>
      )}

      {/* ── Status ───────────────────────────────────────────────────────── */}
      <section className="px-4 pt-5">
        <h2 className="text-[24px] font-extrabold leading-tight tracking-[-0.02em]" style={{ color: ended ? T.red : T.ink }}>{head.title}</h2>
        <p className="mt-1 text-[15px]" style={{ color: T.ink2 }}>{head.sub}</p>
        {!ended && stageIdx >= 0 && (
          <div className="mt-4" aria-label={`Step ${stageIdx + 1} of ${STAGES.length}: ${STAGES[stageIdx].label}`}>
            <div className="flex gap-1.5">
              {STAGES.map((s, i) => (
                <span key={s.key} className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: T.line }}>
                  <span className={`block h-full rounded-full ${i === stageIdx && !delivered ? 'animate-pulse' : ''}`}
                    style={{ width: i <= stageIdx ? '100%' : '0%', background: T.green }} />
                </span>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[12px] font-semibold">
              <span style={{ color: T.ink }}>{STAGES[stageIdx].label}</span>
              {!delivered && <span style={{ color: T.ink3 }}>Next: {STAGES[stageIdx + 1]?.label}</span>}
            </div>
          </div>
        )}
      </section>

      {/* ── Your Mzaya ───────────────────────────────────────────────────── */}
      {live && (
        <section className="mx-4 mt-5 flex items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: T.line }}>
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-[18px] font-extrabold" style={{ background: T.greenTint, color: T.greenDeep }}>
            {(mzaya?.name || 'M').trim().charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[16px] font-bold">{mzaya?.name || 'Your Mzaya'}</span>
            <span className="block text-[13px]" style={{ color: T.ink2 }}>{riderLoc ? 'Sharing live location' : 'Location will appear shortly'}</span>
          </span>
          <RoundAction label="Message your Mzaya" onClick={() => setShowChat(true)}><MessageCircle size={19} strokeWidth={2.2} /></RoundAction>
          {mzaya?.phone && (
            <RoundAction label={`Call ${mzaya.name}`} href={`tel:${mzaya.phone}`}><Phone size={18} strokeWidth={2.2} /></RoundAction>
          )}
        </section>
      )}

      {/* ── Payment (the only place a method is chosen) ──────────────────── */}
      {unpaid && !ended && !delivered && (
        <section className="mt-5 px-4">
          <PaymentPanel order={order} onPaid={refresh} />
        </section>
      )}
      {unpaid && delivered && (
        <p className="mx-4 mt-5 rounded-xl px-4 py-3 text-[13px]" style={{ background: T.amberTint, color: T.amber }}>
          <span className="block font-bold">Payment outstanding</span>
          This order was delivered but the payment hasn&apos;t cleared. Contact support if you think this is wrong.
        </p>
      )}

      {/* ── Fare offers ──────────────────────────────────────────────────── */}
      {awaitingOffers && (
        <Block title="Mzaya offers" right={<>Your fare <Money usd={order.offered_fare_usd} /></>}>
          {!offers?.length ? (
            <p className="py-4 text-center text-[14px]" style={{ color: T.ink2 }}>
              Waiting for Mzayas to respond. They can accept your fare or suggest another price.
            </p>
          ) : (
            <ul>
              {offers.map((o) => (
                <li key={o.id} className="flex items-center gap-3 border-b py-3 last:border-b-0" style={{ borderColor: T.line }}>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[15px] font-bold">{o.rider?.name || 'Mzaya'}</span>
                      <span className="rounded-md px-1.5 py-0.5 text-[11px] font-bold"
                        style={o.type === 'counter' ? { background: T.amberTint, color: T.amber } : { background: T.greenTint, color: '#0A7A3D' }}>
                        {o.type === 'counter' ? 'Counter offer' : 'Accepts your fare'}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[12px]" style={{ color: T.ink2 }}>
                      {(o.rider_profile?.vehicle_type || 'vehicle').replace('_', ' ')}
                      {o.rider_profile?.total_deliveries != null && ` · ${o.rider_profile.total_deliveries} trips`}
                      {o.rider_profile?.rating > 0 && ` · ${Number(o.rider_profile.rating).toFixed(1)} stars`}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block text-[15px] font-extrabold"><Money usd={o.amount_usd} /></span>
                    <button type="button" onClick={() => chooseOffer.mutate(o.id)} disabled={chooseOffer.isPending}
                      className="mt-1 h-8 rounded-full px-4 text-[13px] font-bold text-white disabled:opacity-50" style={{ background: T.green }}>
                      Choose
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Block>
      )}

      {/* ── Delivered: proof, rating, reorder ────────────────────────────── */}
      {delivered && order.delivery_proof_url && (
        <Block title="Proof of delivery" icon={<Camera size={16} strokeWidth={2.2} />}>
          <img src={imageUrl(order.delivery_proof_url, 800)} alt="Your order at the drop-off" className="max-h-72 w-full rounded-xl object-cover" />
          <p className="mt-2 text-[12px]" style={{ color: T.ink3 }}>Photo taken by your Mzaya at drop-off.</p>
        </Block>
      )}
      {delivered && <RateOrder order={order} onRated={refresh} />}

      {/* ── Route ────────────────────────────────────────────────────────── */}
      <Block title="Delivery">
        <ol className="relative">
          <span aria-hidden="true" className="absolute left-[11px] top-6 h-[calc(100%-48px)] w-0.5" style={{ background: T.line }} />
          <RouteStop icon={<Store size={13} strokeWidth={2.4} />} label="Pickup" text={order.pickup_address} />
          <RouteStop icon={<MapPin size={13} strokeWidth={2.4} />} label="Drop-off" text={order.dropoff_address}
            extra={order.dropoff_landmark} strong />
        </ol>
      </Block>

      {/* ── Items + receipt ──────────────────────────────────────────────── */}
      <Block title="Your order">
        {detail?.items?.length > 0 && (
          <ul className="mb-3">
            {detail.items.map((item, i) => (
              <li key={`${item.menu_item_id || item.name}-${i}`} className="flex justify-between gap-3 py-1.5 text-[14px]">
                <span><span className="font-bold">{item.qty}×</span> {item.name}</span>
                <span className="font-semibold"><Money usd={item.unit_price_usd * item.qty} /></span>
              </li>
            ))}
          </ul>
        )}
        <div className="border-t pt-2" style={{ borderColor: T.line }}>
          <Line label="Subtotal" value={<Money usd={order.subtotal_usd} />} />
          <Line label="Delivery fee" value={<Money usd={order.delivery_fee_usd} />} />
          {/* Tip and discount were missing here, so the lines didn't add up to the total. */}
          {Number(order.tip_usd) > 0 && <Line label="Mzaya tip" value={<Money usd={order.tip_usd} />} />}
          {Number(order.discount_usd) > 0 && <Line label="Discount" value={<>-<Money usd={order.discount_usd} /></>} green />}
          <div className="mt-1 flex items-center justify-between border-t pt-2" style={{ borderColor: T.line }}>
            <span className="text-[16px] font-extrabold">Total</span>
            <span className="text-[16px] font-extrabold"><Money usd={order.total_usd} /></span>
          </div>
          {order.total_zig && <p className="mt-0.5 text-right text-[12px]" style={{ color: T.ink3 }}>About ZiG {Number(order.total_zig).toFixed(2)}</p>}
          {/* The method is a placeholder until the customer pays, so only show it once paid. */}
          <p className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: unpaid ? T.amber : '#0A7A3D' }}>
            {unpaid ? 'Not paid yet' : <><Check size={15} strokeWidth={2.6} /> Paid with {String(order.payment_method).replace('_', ' ')}</>}
          </p>
        </div>
        {(delivered || ended) && detail?.items?.length > 0 && (
          <button type="button" onClick={() => reorder(order)}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full border text-[15px] font-bold active:scale-[0.99] transition-transform"
            style={{ borderColor: T.ink, color: T.ink }}>
            <RotateCcw size={16} strokeWidth={2.4} /> Order this again
          </button>
        )}
      </Block>

      {/* ── Cancel (with confirmation: it used to cancel on one tap) ─────── */}
      {['pending', 'accepted', 'scheduled'].includes(order.status) && (
        <div className="mt-6 px-4">
          <button type="button" onClick={() => setConfirmCancel(true)}
            className="h-12 w-full rounded-full text-[15px] font-bold active:bg-black/5" style={{ color: T.red }}>
            Cancel order
          </button>
        </div>
      )}

      {confirmCancel && (
        <Sheet onClose={() => setConfirmCancel(false)} label="Cancel this order?">
          <h2 className="text-[20px] font-extrabold">Cancel this order?</h2>
          <p className="mt-1 text-[14px]" style={{ color: T.ink2 }}>
            {order.rider_id ? 'Your Mzaya has already accepted it and may be on the way.' : 'We will stop looking for a Mzaya.'}
            {!unpaid && ' Your payment will be refunded.'}
          </p>
          {cancelMutation.isError && (
            <p className="mt-3 text-[13px] font-semibold" style={{ color: T.red }}>
              {cancelMutation.error?.response?.data?.error || 'Could not cancel. Please try again.'}
            </p>
          )}
          <div className="mt-5 grid gap-2">
            <button type="button" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}
              className="h-12 rounded-full text-[15px] font-bold text-white disabled:opacity-60" style={{ background: T.red }}>
              {cancelMutation.isPending ? 'Cancelling' : 'Yes, cancel order'}
            </button>
            <button type="button" onClick={() => setConfirmCancel(false)}
              className="h-12 rounded-full text-[15px] font-bold" style={{ background: T.fill, color: T.ink }}>
              Keep my order
            </button>
          </div>
        </Sheet>
      )}

      {showChat && <OrderChat orderId={id} onClose={() => setShowChat(false)} />}
    </main>
  )
}

// ─── Live map ─────────────────────────────────────────────────────────────────
function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L)
  if (window.__leafletLoading) return window.__leafletLoading
  window.__leafletLoading = new Promise((resolve, reject) => {
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(css)
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve(window.L)
    script.onerror = reject
    document.body.appendChild(script)
  })
  return window.__leafletLoading
}

const pin = (bg, svg) => `<div style="width:34px;height:34px;border-radius:50%;background:${bg};border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,.25)">${svg}</div>`
const BIKE_SVG = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>'
const HOME_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V21H3z"/></svg>'

function LiveMap({ rider, dropoff }) {
  const el = useRef(null)
  const map = useRef(null)
  const riderMarker = useRef(null)
  const dropMarker = useRef(null)
  const [ready, setReady] = useState(!!window.L)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadLeaflet().then(() => { if (!cancelled) setReady(true) }).catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!ready || !el.current || map.current) return
    const L = window.L
    map.current = L.map(el.current, { zoomControl: false, attributionControl: false }).setView([-17.8252, 31.0335], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map.current)
  }, [ready])

  // Place / move markers and keep both the Mzaya and the drop-off in view.
  useEffect(() => {
    const L = window.L
    if (!ready || !map.current || !L) return
    const icon = (bg, svg) => L.divIcon({ html: pin(bg, svg), className: '', iconSize: [34, 34], iconAnchor: [17, 17] })
    const drop = dropoff?.lat != null ? [Number(dropoff.lat), Number(dropoff.lng)] : null
    const me = rider ? [rider.lat, rider.lng] : null
    if (drop && !dropMarker.current) dropMarker.current = L.marker(drop, { icon: icon(T.ink, HOME_SVG) }).addTo(map.current)
    if (me) {
      if (!riderMarker.current) riderMarker.current = L.marker(me, { icon: icon(T.green, BIKE_SVG) }).addTo(map.current)
      else riderMarker.current.setLatLng(me)
    }
    const points = [drop, me].filter(Boolean)
    if (points.length === 2) map.current.fitBounds(points, { padding: [48, 48], maxZoom: 16 })
    else if (points.length === 1) map.current.setView(points[0], 15)
  }, [ready, rider, dropoff])

  return (
    <div className="relative h-[260px]" style={{ background: T.fill }}>
      <div ref={el} className="h-full w-full" />
      {(failed || !rider) && (
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold shadow"
          style={{ color: T.ink2, zIndex: 1000 }}>
          {failed ? 'Map unavailable right now' : 'Waiting for your Mzaya\u2019s location'}
        </span>
      )}
    </div>
  )
}

// ─── Rating ───────────────────────────────────────────────────────────────────
function RateOrder({ order, onRated }) {
  const [stars, setStars] = useState(0)
  const [review, setReview] = useState('')
  const rate = useMutation({
    mutationFn: () => api.post(`/orders/${order.id}/rate`, { rating: stars, review }),
    onSuccess: onRated,
  })
  const saved = order.rating || (rate.isSuccess ? stars : 0)

  if (saved) {
    return (
      <Block title="Your rating">
        <StarRow value={saved} size={22} />
        <p className="mt-2 text-[13px]" style={{ color: T.ink2 }}>Thanks. Your rating helps other customers and your Mzaya.</p>
      </Block>
    )
  }
  return (
    <Block title="How was your order?">
      <StarRow value={stars} onChange={setStars} size={34} />
      {stars > 0 && (
        <>
          <textarea value={review} onChange={(e) => setReview(e.target.value)} rows={2} maxLength={1000}
            placeholder="Anything to add? (optional)" aria-label="Review"
            className="mt-3 w-full resize-none rounded-xl border px-4 py-3 text-[15px] outline-none focus:border-[#00A651]" style={{ borderColor: T.line }} />
          {rate.isError && <p className="mt-1 text-[13px]" style={{ color: T.red }}>{rate.error?.response?.data?.error || 'Could not save your rating.'}</p>}
          <button type="button" onClick={() => rate.mutate()} disabled={rate.isPending}
            className="mt-3 h-12 w-full rounded-full text-[15px] font-bold text-white disabled:opacity-60" style={{ background: T.green }}>
            {rate.isPending ? 'Saving' : 'Submit rating'}
          </button>
        </>
      )}
    </Block>
  )
}

function StarRow({ value, onChange, size }) {
  return (
    <div className="flex gap-1.5" role={onChange ? 'radiogroup' : undefined} aria-label={onChange ? 'Rating' : `${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n <= value
        const star = <Star size={size} strokeWidth={1.8} fill={on ? '#F5B400' : 'none'} style={{ color: on ? '#F5B400' : '#C9D0CD' }} />
        return onChange ? (
          <button key={n} type="button" role="radio" aria-checked={n === value} aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onClick={() => onChange(n)} className="active:scale-90 transition-transform">{star}</button>
        ) : <span key={n}>{star}</span>
      })}
    </div>
  )
}

// ─── Small pieces ─────────────────────────────────────────────────────────────
function Block({ title, right, icon, children }) {
  return (
    <section className="mt-5 border-t px-4 pt-5" style={{ borderColor: T.line }}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[17px] font-extrabold">{icon}{title}</h2>
        {right && <span className="text-[13px]" style={{ color: T.ink2 }}>{right}</span>}
      </div>
      {children}
    </section>
  )
}

function RouteStop({ icon, label, text, extra, strong }) {
  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      <span className="relative z-10 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: strong ? T.ink : T.ink3 }}>{icon}</span>
      <span className="min-w-0">
        <span className="block text-[12px] font-semibold uppercase tracking-[0.05em]" style={{ color: T.ink3 }}>{label}</span>
        <span className="block text-[15px] font-semibold">{text}</span>
        {extra && <span className="block text-[13px]" style={{ color: T.ink2 }}>{extra}</span>}
      </span>
    </li>
  )
}

function RoundAction({ label, onClick, href, children }) {
  const cls = 'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full active:scale-95 transition-transform'
  const style = { background: T.fill, color: T.ink }
  return href
    ? <a href={href} aria-label={label} className={cls} style={style}>{children}</a>
    : <button type="button" aria-label={label} onClick={onClick} className={cls} style={style}>{children}</button>
}

function Line({ label, value, green }) {
  return (
    <div className="flex items-center justify-between py-1 text-[14px]">
      <span style={{ color: green ? T.green : T.ink2 }}>{label}</span>
      <span className="font-semibold" style={{ color: green ? T.green : T.ink }}>{value}</span>
    </div>
  )
}

function Sheet({ label, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[1100]" role="dialog" aria-modal="true" aria-label={label}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-md rounded-t-[22px] bg-white px-5 pt-3"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/15" />
        <button type="button" aria-label="Close" onClick={onClose} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full active:bg-black/5">
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}
