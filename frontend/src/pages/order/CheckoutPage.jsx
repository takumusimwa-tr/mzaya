import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ChevronDown, Clock, Crosshair, Link2, MapPin, MessageCircle, Tag, Truck, X, Zap,
} from 'lucide-react'
import api, { orderAPI, geoAPI, promoAPI } from '../../api/api'
import useCartStore from '../../store/useCartStore'
import Money from '../../components/ui/Money'

const T = {
  green: '#00A651', greenDeep: '#0B4A3F', greenTint: '#E9F7EF',
  ink: '#16191A', ink2: '#5F6B66', ink3: '#8C9692', line: '#ECEFED', fill: '#F4F6F5',
  red: '#C0392B', amber: '#9A6200', amberTint: '#FFF6E6',
}

// Build category-specific order detail. Includes total_weight_kg so the backend
// can size the vehicle correctly (grocery/materials); harmless for food.
function buildDetail(cart, totalWeightKg) {
  const items = cart.items.map((i) => ({
    menu_item_id:   i.id,
    name:           i.name,
    qty:            i.qty,
    unit_price_usd: i.unit_price_usd,
    weight_kg:      i.weight_kg || 0,
    special_instructions: i.special_instructions,
  }))

  const base = { items, total_weight_kg: totalWeightKg }

  switch (cart.categoryType) {
    case 'food':
      return { ...base, restaurant_id: cart.vendorId, restaurant_name: cart.vendorName }
    case 'grocery':
      return { ...base, store_id: cart.vendorId, store_name: cart.vendorName }
    case 'materials':
      return { ...base, supplier_id: cart.vendorId, supplier_name: cart.vendorName }
    default:
      return { ...base, vendor_id: cart.vendorId, vendor_name: cart.vendorName }
  }
}

// <input type="datetime-local"> takes LOCAL time. The old code passed a UTC ISO
// string, so in Harare (UTC+2) the earliest allowed slot was two hours early and
// the picker offered times that validation then rejected.
function toLocalInputValue(date) {
  const p = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`
}

const TIPS = [0, 1, 2, 5]
const NEGOTIABLE = ['materials', 'errand']

export default function CheckoutPage() {
  const navigate = useNavigate()
  const cart = useCartStore()
  const dropoffRef = useRef(null)

  const { data: savedAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get('/addresses').then((r) => r.data.addresses),
  })

  const [dropoff, setDropoff] = useState('')
  const [savedId, setSavedId] = useState(null)
  const [landmark, setLandmark] = useState('')
  const [pinLink, setPinLink] = useState('')
  const [pinCoords, setPinCoords] = useState(null)
  const [pinStatus, setPinStatus] = useState('') // '', 'loading', 'ok', 'error'
  const [pinError, setPinError] = useState('')
  const [instructions, setInstructions] = useState('')
  const [tip, setTip] = useState(0)
  const [customTip, setCustomTip] = useState('')
  const [nameYourFare, setNameYourFare] = useState(false)
  const [offeredFare, setOfferedFare] = useState('')
  const [promoOpen, setPromoOpen] = useState(false)
  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState(null) // { code, discount_usd, free_delivery }
  const [promoStatus, setPromoStatus] = useState('')
  const [promoError, setPromoError] = useState('')
  const [scheduleMode, setScheduleMode] = useState('now') // 'now' | 'later'
  const [scheduledFor, setScheduledFor] = useState('')
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [addressInvalid, setAddressInvalid] = useState(false)

  const subtotal = cart.totalPrice()
  const totalWeight = cart.totalWeight()
  const itemCount = cart.totalItems()

  // Longest prep time in the cart drives the earliest a scheduled order can be.
  const longestPrep = cart.items.reduce((max, i) => Math.max(max, i.prep_minutes || 0), 0)
  const minLeadMinutes = Math.max(30, longestPrep)

  // Live quote from the backend: the single source of truth for fee and vehicle,
  // computed exactly as at placement, so the price shown is the price charged.
  const { data: quote, isLoading: quoteLoading, isError: quoteError } = useQuery({
    queryKey: ['quote', cart.categoryType, subtotal, totalWeight, tip, promo?.discount_usd || 0],
    enabled: cart.items.length > 0,
    queryFn: () =>
      orderAPI.quote({
        category_type: cart.categoryType,
        detail: buildDetail(cart, totalWeight),
        tip_usd: tip,
        discount_usd: promo?.discount_usd || 0,
      }).then((r) => r.data.quote),
  })

  const deliveryFee = quote ? quote.delivery_fee_usd : null
  const total = quote ? quote.total_usd : subtotal
  const canNegotiate = NEGOTIABLE.includes(cart.categoryType)

  // ── Location ────────────────────────────────────────────────────────────────
  // Resolve a pasted WhatsApp/Maps pin to coordinates via the backend.
  const resolvePin = async (link) => {
    const value = (link ?? pinLink).trim()
    if (!value) return
    setPinStatus('loading')
    setPinError('')
    try {
      const { data } = await geoAPI.resolvePin(value)
      setPinCoords({ lat: data.lat, lng: data.lng })
      setPinStatus('ok')
      if (data.warn) setPinError(data.warn)
    } catch (err) {
      setPinCoords(null)
      setPinStatus('error')
      setPinError(err.response?.data?.error || "Couldn't read that location link")
    }
  }

  // Auto-resolve as soon as a link is pasted (no extra tap).
  const onPinPaste = (value) => {
    setPinLink(value)
    setPinStatus('')
    setPinCoords(null)
    setPinError('')
    const looksLikeLink = /https?:\/\/|maps\.|goo\.gl|-?\d+\.\d+,\s*-?\d+\.\d+/i.test(value)
    if (looksLikeLink && value.trim().length > 8) resolvePin(value)
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setPinStatus('error')
      setPinError('Your device does not support location. Paste a pin instead.')
      return
    }
    setPinStatus('loading')
    setPinError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPinCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setPinStatus('ok')
        setPinLink('')
      },
      () => {
        setPinStatus('error')
        setPinError('Location access denied. Paste a shared pin or type the address.')
      },
      { timeout: 8000, enableHighAccuracy: true, maximumAge: 60000 }
    )
  }

  const requestViaWhatsApp = () => {
    const msg = encodeURIComponent(
      'Hi! Please share your location pin so I can send your Mzaya delivery. '
      + 'Tap the attach button, then Location, then Send your current location, and send me the link.'
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const clearPin = () => {
    setPinLink(''); setPinCoords(null); setPinStatus(''); setPinError('')
  }

  // A saved address carries its pin and notes, not just the street text.
  const pickSaved = (addr) => {
    setSavedId(addr.id)
    setDropoff(addr.address)
    if (addressInvalid) setError('')
    setAddressInvalid(false)
    if (addr.location?.lat != null && addr.location?.lng != null) {
      setPinCoords({ lat: Number(addr.location.lat), lng: Number(addr.location.lng) })
      setPinStatus('ok'); setPinLink(''); setPinError('')
    }
    if (addr.notes) setLandmark(addr.notes)
  }

  // ── Promo ───────────────────────────────────────────────────────────────────
  const applyPromo = async () => {
    const code = promoInput.trim()
    if (!code) return
    setPromoStatus('loading')
    setPromoError('')
    try {
      const { data } = await promoAPI.validate({
        code,
        category_type: cart.categoryType,
        detail: buildDetail(cart, totalWeight),
      })
      if (data.valid) {
        setPromo({ code: data.code, discount_usd: data.discount_usd, free_delivery: data.free_delivery })
        setPromoStatus('ok')
      } else {
        setPromo(null)
        setPromoStatus('error')
        setPromoError(data.reason || 'That code is not valid')
      }
    } catch (err) {
      setPromo(null)
      setPromoStatus('error')
      setPromoError(err.response?.data?.error || 'Could not apply that code')
    }
  }

  const removePromo = () => {
    setPromo(null); setPromoInput(''); setPromoStatus(''); setPromoError('')
  }

  // ── Place order ─────────────────────────────────────────────────────────────
  const fail = (message, { address = false } = {}) => {
    setError(message)
    if (address) {
      setAddressInvalid(true)
      dropoffRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      dropoffRef.current?.focus({ preventScroll: true })
    }
  }

  const handleSubmit = async () => {
    setError('')

    if (!dropoff.trim()) return fail('Add your delivery address', { address: true })
    if (canNegotiate && nameYourFare) {
      const f = parseFloat(offeredFare)
      if (!f || f <= 0) return fail('Enter the fare you want to offer')
    }
    if (scheduleMode === 'later') {
      if (!scheduledFor) return fail('Pick a delivery time')
      const when = new Date(scheduledFor).getTime()
      if (when < Date.now() + minLeadMinutes * 60 * 1000) {
        return fail(`Schedule at least ${minLeadMinutes} minutes ahead${longestPrep > 30 ? ' (some items need prep time)' : ''}`)
      }
    }

    setLoading(true)
    try {
      const useNegotiation = canNegotiate && nameYourFare
      const orderData = {
        category_type: cart.categoryType,
        city: cart.vendorCity || 'harare', // the order belongs to the vendor's city
        pickup_address: cart.vendorAddress,
        dropoff_address: dropoff,
        dropoff_location: pinCoords || null,
        dropoff_landmark: landmark || null,
        // Placeholder: the customer picks the real method on the pay step, which
        // overwrites this. The orders table needs a non-null value here.
        payment_method: 'ecocash',
        tip_usd: tip,
        promo_code: promo?.code || null,
        scheduled_for: scheduleMode === 'later' && scheduledFor ? new Date(scheduledFor).toISOString() : null,
        special_instructions: instructions || null,
        detail: buildDetail(cart, totalWeight),
        ...(useNegotiation ? { is_negotiable: true, offered_fare_usd: parseFloat(offeredFare) } : {}),
      }

      const { data } = await orderAPI.place(orderData)
      // Leave the page BEFORE emptying the cart: an empty cart redirects this
      // page to Home, which would race the move to the new order.
      navigate(`/orders/${data.order.id}`, { replace: true })
      cart.clearCart()
    } catch (err) {
      setError(err.response?.data?.error || 'Could not place your order. Please try again.')
    } finally {
      setLoading(false)
    }
    return undefined
  }

  if (cart.items.length === 0) return <Navigate to="/home" replace />

  // Only worth mentioning for a real (non-light) vehicle.
  const showVehicleNote = quote?.vehicle && !['bicycle', 'motorbike'].includes(quote.vehicle.type)
  const feeValue = quoteLoading && !quote ? 'Calculating' : quoteError ? 'Unavailable' : <Money usd={deliveryFee} />

  return (
    <main className="min-h-screen bg-white pb-44" style={{ color: T.ink }}>
      <header className="sticky top-0 z-20 flex items-center gap-1 bg-white/95 px-2 backdrop-blur"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <button type="button" aria-label="Back" onClick={() => navigate(-1)} className="flex h-11 w-11 items-center justify-center rounded-full active:bg-black/5">
          <ArrowLeft size={21} strokeWidth={2.2} />
        </button>
        <div className="flex h-14 min-w-0 flex-1 flex-col justify-center">
          <h1 className="text-[18px] font-extrabold leading-tight">Checkout</h1>
          <p className="truncate text-[12px]" style={{ color: T.ink2 }}>{cart.vendorName}</p>
        </div>
      </header>

      {/* ── When ─────────────────────────────────────────────────────────── */}
      <div className="px-4 pt-2">
        <div className="grid grid-cols-2 rounded-full p-1" style={{ background: T.fill }} role="tablist" aria-label="Delivery time">
          {[['now', 'Deliver now', Zap], ['later', 'Schedule', Clock]].map(([mode, label, IconC]) => {
            const active = scheduleMode === mode
            return (
              <button key={mode} type="button" role="tab" aria-selected={active} onClick={() => setScheduleMode(mode)}
                className="flex h-10 items-center justify-center gap-1.5 rounded-full text-[14px] font-bold transition-colors"
                style={active ? { background: '#fff', color: T.ink, boxShadow: '0 1px 4px rgba(0,0,0,0.12)' } : { color: T.ink2 }}>
                <IconC size={15} strokeWidth={2.4} />{label}
              </button>
            )
          })}
        </div>
        {scheduleMode === 'later' && (
          <div className="mt-3">
            <input type="datetime-local" value={scheduledFor}
              min={toLocalInputValue(new Date(Date.now() + minLeadMinutes * 60 * 1000))}
              onChange={(e) => setScheduledFor(e.target.value)}
              aria-label="Delivery date and time"
              className="h-12 w-full rounded-xl border px-4 text-[15px] outline-none focus:border-[#00A651]" style={{ borderColor: T.line }} />
            <p className="mt-1.5 text-[12px]" style={{ color: T.ink2 }}>
              {longestPrep > 30
                ? `Some items need about ${longestPrep} min to prepare, so the earliest is ${minLeadMinutes} minutes from now.`
                : 'At least 30 minutes ahead, up to 7 days. We send a Mzaya close to your chosen time.'}
            </p>
          </div>
        )}
      </div>

      {/* ── Where ────────────────────────────────────────────────────────── */}
      <Section title="Deliver to">
        {savedAddresses?.length > 0 && (
          <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 no-scrollbar">
            {savedAddresses.map((addr) => {
              const active = savedId === addr.id && dropoff === addr.address
              return (
                <button key={addr.id} type="button" onClick={() => pickSaved(addr)}
                  className="flex h-10 flex-shrink-0 items-center gap-1.5 rounded-full border px-4 text-[14px] font-semibold active:scale-95 transition-transform"
                  style={active ? { borderColor: T.green, background: T.greenTint, color: T.greenDeep } : { borderColor: T.line, color: T.ink }}>
                  <MapPin size={15} strokeWidth={2.2} />{addr.label}
                </button>
              )
            })}
          </div>
        )}

        <Field label="Address" required invalid={addressInvalid}>
          <input ref={dropoffRef} type="text" value={dropoff}
            onChange={(e) => { setDropoff(e.target.value); if (addressInvalid) setError(''); setAddressInvalid(false); setSavedId(null) }}
            placeholder="House number, street and suburb" autoComplete="street-address"
            className="h-12 w-full bg-transparent px-4 text-[15px] outline-none" />
        </Field>

        {/* Exact drop-off pin: GPS first, pasted pin second, ask on WhatsApp third */}
        <div className="mt-3">
          {pinStatus === 'ok' ? (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: T.greenTint }}>
              <MapPin size={18} strokeWidth={2.2} style={{ color: T.green }} />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold" style={{ color: T.greenDeep }}>Exact location pinned</span>
                <span className="block text-[12px]" style={{ color: T.ink2 }}>Your Mzaya will navigate straight to it</span>
              </span>
              <button type="button" onClick={clearPin} className="text-[13px] font-bold" style={{ color: T.green }}>Change</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={useCurrentLocation} disabled={pinStatus === 'loading'}
                  className="flex h-11 items-center justify-center gap-1.5 rounded-xl text-[14px] font-bold text-white disabled:opacity-60 active:scale-[0.98] transition-transform"
                  style={{ background: T.green }}>
                  <Crosshair size={16} strokeWidth={2.4} />{pinStatus === 'loading' ? 'Locating' : 'Use my location'}
                </button>
                <button type="button" onClick={requestViaWhatsApp}
                  className="flex h-11 items-center justify-center gap-1.5 rounded-xl border text-[14px] font-bold active:scale-[0.98] transition-transform"
                  style={{ borderColor: T.line, color: T.ink }}>
                  <MessageCircle size={16} strokeWidth={2.4} />Ask on WhatsApp
                </button>
              </div>
              <label className="mt-2 flex h-11 items-center gap-2 rounded-xl px-3" style={{ background: T.fill }}>
                <Link2 size={16} style={{ color: T.ink3 }} />
                <input type="text" value={pinLink} onChange={(e) => onPinPaste(e.target.value)}
                  placeholder="Or paste a WhatsApp or Maps pin link" aria-label="Location pin link"
                  className="h-full flex-1 bg-transparent text-[14px] outline-none" />
              </label>
            </>
          )}
          {pinStatus === 'error' && <p className="mt-1.5 text-[12px]" style={{ color: T.red }}>{pinError}</p>}
          {pinStatus === 'ok' && pinError && <p className="mt-1.5 text-[12px]" style={{ color: T.amber }}>{pinError}</p>}
        </div>

        <div className="mt-3 grid gap-3">
          <Field label="Landmark or directions">
            <input type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)}
              placeholder="Blue gate opposite the garage"
              className="h-12 w-full bg-transparent px-4 text-[15px] outline-none" />
          </Field>
          <Field label="Note for your Mzaya">
            <input type="text" value={instructions} onChange={(e) => setInstructions(e.target.value)}
              placeholder="Call when you arrive"
              className="h-12 w-full bg-transparent px-4 text-[15px] outline-none" />
          </Field>
        </div>
      </Section>

      {showVehicleNote && (
        <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: T.amberTint }}>
          <Truck size={18} strokeWidth={2.2} style={{ color: T.amber }} className="mt-0.5 flex-shrink-0" />
          <span>
            <span className="block text-[14px] font-bold" style={{ color: T.amber }}>This load needs a {quote.vehicle.name}</span>
            <span className="block text-[12px]" style={{ color: T.amber }}>{quote.vehicle.hint} · about {totalWeight.toFixed(0)}kg in total</span>
          </span>
        </div>
      )}

      {/* ── Name your fare (materials, errands) ──────────────────────────── */}
      {canNegotiate && (
        <Section>
          <div className="flex items-center justify-between gap-3">
            <span>
              <span className="block text-[16px] font-extrabold">Name your fare</span>
              <span className="block text-[13px]" style={{ color: T.ink2 }}>Offer a price. Mzayas accept or counter.</span>
            </span>
            <button type="button" role="switch" aria-checked={nameYourFare} aria-label="Name your fare"
              onClick={() => setNameYourFare((v) => !v)}
              className="relative h-7 w-12 flex-shrink-0 rounded-full transition-colors" style={{ background: nameYourFare ? T.green : '#D5DBD8' }}>
              <span className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all" style={{ left: nameYourFare ? 22 : 2 }} />
            </button>
          </div>
          {nameYourFare && (
            <div className="mt-3">
              <Field label="Your offer">
                <span className="flex items-center px-4">
                  <span className="text-[15px] font-bold" style={{ color: T.ink3 }}>US$</span>
                  <input type="number" inputMode="decimal" value={offeredFare} onChange={(e) => setOfferedFare(e.target.value)}
                    placeholder={quote ? deliveryFee.toFixed(2) : '0.00'}
                    className="h-12 w-full bg-transparent pl-2 text-[18px] font-bold outline-none" />
                </span>
              </Field>
              <p className="mt-1.5 text-[12px]" style={{ color: T.ink2 }}>
                {quote ? <>Suggested fare about <Money usd={deliveryFee} />, based on distance and load. </> : null}
                Nearby Mzayas see your offer and can accept or suggest another price.
              </p>
            </div>
          )}
        </Section>
      )}

      {/* ── Order summary ────────────────────────────────────────────────── */}
      <Section>
        <button type="button" onClick={() => setSummaryOpen((v) => !v)} aria-expanded={summaryOpen}
          className="flex w-full items-center justify-between text-left">
          <span>
            <span className="block text-[16px] font-extrabold">Order summary</span>
            <span className="block text-[13px]" style={{ color: T.ink2 }}>{itemCount} {itemCount === 1 ? 'item' : 'items'} from {cart.vendorName}</span>
          </span>
          <ChevronDown size={20} style={{ color: T.ink2, transform: summaryOpen ? 'rotate(180deg)' : 'none' }} className="transition-transform" />
        </button>
        {summaryOpen && (
          <ul className="mt-3">
            {cart.items.map((item, i) => (
              <li key={`${item.id}-${i}`} className="flex justify-between gap-3 py-1.5 text-[14px]">
                <span><span className="font-bold">{item.qty}×</span> {item.name}</span>
                <span className="font-semibold"><Money usd={item.unit_price_usd * item.qty} /></span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ── Tip ──────────────────────────────────────────────────────────── */}
      <Section title="Tip your Mzaya" sub="100% goes to your Mzaya. Optional, always appreciated.">
        <div className="grid grid-cols-4 gap-2">
          {TIPS.map((amt) => {
            const active = tip === amt && customTip === ''
            return (
              <button key={amt} type="button" onClick={() => { setTip(amt); setCustomTip('') }} aria-pressed={active}
                className="h-11 rounded-full border text-[14px] font-bold transition-colors active:scale-95"
                style={active ? { borderColor: T.ink, background: T.ink, color: '#fff' } : { borderColor: T.line, color: T.ink }}>
                {amt === 0 ? 'None' : `US$${amt}`}
              </button>
            )
          })}
        </div>
        <label className="mt-2 flex h-11 items-center gap-1 rounded-full border px-4" style={{ borderColor: customTip ? T.ink : T.line }}>
          <span className="text-[14px] font-semibold" style={{ color: T.ink3 }}>US$</span>
          <input type="text" inputMode="decimal" value={customTip} aria-label="Custom tip"
            onChange={(e) => {
              const v = e.target.value.replace(/[^\d.]/g, '')
              setCustomTip(v)
              setTip(v ? Math.max(0, parseFloat(v) || 0) : 0)
            }}
            placeholder="Other amount" className="h-full flex-1 bg-transparent text-[14px] outline-none" />
        </label>
      </Section>

      {/* ── Promo ────────────────────────────────────────────────────────── */}
      <Section>
        {promoStatus === 'ok' && promo ? (
          <div className="flex items-center gap-3">
            <Tag size={18} strokeWidth={2.2} style={{ color: T.green }} />
            <span className="flex-1">
              <span className="block text-[15px] font-bold">{promo.code}</span>
              <span className="block text-[13px]" style={{ color: T.green }}>
                {promo.free_delivery ? 'Free delivery applied' : <>You save <Money usd={promo.discount_usd} /></>}
              </span>
            </span>
            <button type="button" onClick={removePromo} aria-label="Remove promo code" className="flex h-9 w-9 items-center justify-center rounded-full active:bg-black/5">
              <X size={18} />
            </button>
          </div>
        ) : !promoOpen ? (
          <button type="button" onClick={() => setPromoOpen(true)} className="flex w-full items-center gap-3 text-left">
            <Tag size={18} strokeWidth={2.2} style={{ color: T.ink }} />
            <span className="flex-1 text-[15px] font-bold">Add a promo code</span>
            <span className="text-[13px] font-bold" style={{ color: T.green }}>Add</span>
          </button>
        ) : (
          <>
            <div className="flex gap-2">
              <input type="text" value={promoInput} autoFocus aria-label="Promo code"
                onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoStatus(''); setPromoError('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyPromo() } }}
                placeholder="Promo code"
                className="h-12 flex-1 rounded-xl border px-4 text-[15px] uppercase outline-none focus:border-[#00A651]" style={{ borderColor: T.line }} />
              <button type="button" onClick={applyPromo} disabled={!promoInput.trim() || promoStatus === 'loading'}
                className="h-12 rounded-xl px-5 text-[14px] font-bold text-white disabled:opacity-50" style={{ background: T.ink }}>
                {promoStatus === 'loading' ? 'Checking' : 'Apply'}
              </button>
            </div>
            {promoStatus === 'error' && <p className="mt-1.5 text-[12px]" style={{ color: T.red }}>{promoError}</p>}
          </>
        )}
      </Section>

      {/* ── Totals ───────────────────────────────────────────────────────── */}
      <Section>
        <Line label="Subtotal" value={<Money usd={subtotal} />} />
        <Line label="Delivery fee" value={feeValue} />
        {tip > 0 && <Line label="Mzaya tip" value={<Money usd={tip} />} />}
        {quote?.discount_usd > 0 && (
          <Line label={`Discount${promo?.code ? ` (${promo.code})` : ''}`} value={<>-<Money usd={quote.discount_usd} /></>} green />
        )}
        <div className="mt-2 flex items-center justify-between border-t pt-3" style={{ borderColor: T.line }}>
          <span className="text-[17px] font-extrabold">Total</span>
          <span className="text-[17px] font-extrabold">{quoteLoading && !quote ? 'Calculating' : <Money usd={total} />}</span>
        </div>
        {quoteError && (
          <p className="mt-2 text-[12px]" style={{ color: T.amber }}>
            We couldn&apos;t fetch the live delivery fee. You&apos;ll see the final amount before you pay.
          </p>
        )}
        <p className="mt-3 text-[12px]" style={{ color: T.ink3 }}>
          You choose how to pay on the next step: EcoCash, OneMoney, InnBucks or card.
        </p>
      </Section>

      {/* ── Place order ──────────────────────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md bg-white px-4 pt-3"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', boxShadow: '0 -8px 24px rgba(0,0,0,0.06)' }}>
        {error && (
          <p role="alert" className="mb-2 rounded-xl px-3 py-2 text-[13px] font-semibold" style={{ background: '#FDECEA', color: T.red }}>
            {error}
          </p>
        )}
        <button type="button" onClick={handleSubmit} disabled={loading}
          className="flex h-14 w-full items-center justify-between rounded-full px-6 text-[16px] font-bold text-white disabled:opacity-70 active:scale-[0.99] transition-transform"
          style={{ background: T.green }}>
          <span>{loading ? 'Placing your order' : scheduleMode === 'later' ? 'Schedule order' : 'Place order'}</span>
          <Money usd={quote ? total : subtotal} />
        </button>
      </div>
    </main>
  )
}

function Section({ title, sub, children }) {
  return (
    <section className="mt-4 border-t px-4 pt-4" style={{ borderColor: T.line }}>
      {title && <h2 className="text-[16px] font-extrabold">{title}</h2>}
      {sub && <p className="mb-3 mt-0.5 text-[13px]" style={{ color: T.ink2 }}>{sub}</p>}
      {title && !sub && <div className="h-3" />}
      {children}
    </section>
  )
}

function Field({ label, required, invalid, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-semibold" style={{ color: invalid ? T.red : T.ink2 }}>
        {label}{required && <span style={{ color: T.red }}> *</span>}
      </span>
      <span className="block rounded-xl border bg-white transition-colors focus-within:border-[#00A651]"
        style={{ borderColor: invalid ? T.red : T.line }}>
        {children}
      </span>
    </label>
  )
}

function Line({ label, value, green }) {
  return (
    <div className="flex items-center justify-between py-1 text-[15px]" style={{ color: green ? T.green : T.ink2 }}>
      <span>{label}</span>
      <span className="font-semibold" style={{ color: green ? T.green : T.ink }}>{value}</span>
    </div>
  )
}
