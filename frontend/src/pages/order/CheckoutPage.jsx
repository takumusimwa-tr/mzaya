import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { orderAPI, geoAPI, promoAPI } from '../../api/api'
import useCartStore from '../../store/useCartStore'
import useAuthStore from '../../store/useAuthStore'
import api from '../../api/api'
import Icon from '../../components/ui/Icon'

const PAYMENT_METHODS = [
  { id: 'ecocash',    label: 'EcoCash',    sub: 'Econet mobile money' },
  { id: 'onemoney',   label: 'OneMoney',   sub: 'NetOne mobile money' },
  { id: 'innbucks',   label: 'InnBucks',   sub: 'InnBucks wallet' },
  { id: 'zipit',      label: 'ZIPIT',      sub: 'Bank transfer (USD)' },
]

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

export default function CheckoutPage() {
  const navigate = useNavigate()
  const cart     = useCartStore()
  const user     = useAuthStore((s) => s.user)

  const { data: savedAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn:  () => api.get('/addresses').then((r) => r.data.addresses),
  })

  const [dropoff, setDropoff]             = useState('')
  const [landmark, setLandmark]           = useState('')
  const [pinLink, setPinLink]             = useState('')
  const [pinCoords, setPinCoords]         = useState(null)
  const [pinStatus, setPinStatus]         = useState('') // '', 'loading', 'ok', 'error'
  const [pinError, setPinError]           = useState('')
  const [instructions, setInstructions]   = useState('')
  const [tip, setTip]                     = useState(0)
  const [customTip, setCustomTip]         = useState('')
  const [nameYourFare, setNameYourFare]   = useState(false)
  const [offeredFare, setOfferedFare]     = useState('')
  const [promoInput, setPromoInput]       = useState('')
  const [promo, setPromo]                 = useState(null) // { code, discount_usd, free_delivery }
  const [promoStatus, setPromoStatus]     = useState('')   // '', 'loading', 'ok', 'error'
  const [promoError, setPromoError]       = useState('')
  const [scheduleMode, setScheduleMode]   = useState('now') // 'now' | 'later'
  const [scheduledFor, setScheduledFor]   = useState('')
  const [paymentMethod, setPaymentMethod] = useState('ecocash')
  const [paymentDetails, setPaymentDetails] = useState({})
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')

  const MOBILE_MONEY = ['ecocash', 'onemoney', 'innbucks', 'omari']
  const needsPhone   = MOBILE_MONEY.includes(paymentMethod)

  const subtotal    = cart.totalPrice()
  const totalWeight = cart.totalWeight()

  // Longest prep time in the cart drives the earliest a scheduled order can be.
  const longestPrep = cart.items.reduce((max, i) => Math.max(max, i.prep_minutes || 0), 0)
  const minLeadMinutes = Math.max(30, longestPrep)

  // ── Live quote from backend — single source of truth for fee + vehicle ──────
  // Recomputes when cart category/subtotal/weight changes. Uses the same logic
  // the backend uses at placement, so the price shown is the price charged.
  const {
    data: quote,
    isLoading: quoteLoading,
    isError: quoteError,
  } = useQuery({
    queryKey: ['quote', cart.categoryType, subtotal, totalWeight, tip, promo?.discount_usd || 0],
    enabled:  cart.items.length > 0,
    queryFn: () =>
      orderAPI.quote({
        category_type: cart.categoryType,
        detail: buildDetail(cart, totalWeight),
        tip_usd: tip,
        discount_usd: promo?.discount_usd || 0,
      }).then((r) => r.data.quote),
  })

  const deliveryFee = quote ? quote.delivery_fee_usd : null
  const total       = quote ? quote.total_usd : subtotal

  // Fare negotiation applies to materials + errands (inDrive-style).
  const NEGOTIABLE = ['materials', 'errand']
  const canNegotiate = NEGOTIABLE.includes(cart.categoryType)

  // Resolve a pasted WhatsApp/Maps pin to coordinates via the backend
  // (backend reads coords directly if present, or follows short goo.gl links).
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
    if (looksLikeLink && value.trim().length > 8) {
      resolvePin(value)
    }
  }

  // One-tap: use the customer's current GPS position as the drop-off.
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

  // Open WhatsApp so the customer can ask someone to share their location pin.
  const requestViaWhatsApp = () => {
    const msg = encodeURIComponent(
      "Hi! Please share your location pin so I can send your Mzaya delivery. " +
      "Tap the 📎 (attach) → Location → Send your current location, then send me the link."
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  const clearPin = () => {
    setPinLink(''); setPinCoords(null); setPinStatus(''); setPinError('')
  }

  // Validate a promo code against the current cart (server computes discount).
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
        setPromoError(data.reason || 'Invalid code')
      }
    } catch (err) {
      setPromo(null)
      setPromoStatus('error')
      setPromoError(err.response?.data?.error || 'Could not apply code')
    }
  }

  const removePromo = () => {
    setPromo(null); setPromoInput(''); setPromoStatus(''); setPromoError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (canNegotiate && nameYourFare) {
      const f = parseFloat(offeredFare)
      if (!f || f <= 0) { setError('Enter the fare you want to offer'); return }
    }
    if (!dropoff.trim()) {
      setError('Please enter your delivery address')
      return
    }
    if (needsPhone && !paymentDetails.phone) {
      setError('Please enter your mobile money number')
      return
    }
    if (scheduleMode === 'later') {
      if (!scheduledFor) { setError('Please pick a delivery time'); return }
      const when = new Date(scheduledFor).getTime()
      if (when < Date.now() + minLeadMinutes * 60 * 1000) {
        setError(`Schedule at least ${minLeadMinutes} minutes ahead${longestPrep > 30 ? ' (some items need prep time)' : ''}`)
        return
      }
    }

    setLoading(true)
    try {
      const useNegotiation = canNegotiate && nameYourFare
      const orderData = {
        category_type:   cart.categoryType,
        city:            cart.vendorCity || 'harare', // order belongs to the vendor's city
        pickup_address:  cart.vendorAddress,
        dropoff_address: dropoff,
        dropoff_location: pinCoords || null,
        dropoff_landmark: landmark || null,
        payment_method:  paymentMethod,
        payment_details: paymentDetails,
        tip_usd:         tip,
        promo_code:      promo?.code || null,
        scheduled_for:   scheduleMode === 'later' && scheduledFor ? new Date(scheduledFor).toISOString() : null,
        special_instructions: instructions || null,
        detail: buildDetail(cart, totalWeight),
        ...(useNegotiation ? {
          is_negotiable:    true,
          offered_fare_usd: parseFloat(offeredFare),
        } : {}),
      }

      const { data } = await orderAPI.place(orderData)
      cart.clearCart()
      navigate(`/orders/${data.order.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not place order')
    } finally {
      setLoading(false)
    }
  }

  if (cart.items.length === 0) {
    navigate('/home')
    return null
  }

  // Show required-vehicle note only when it's a real (non-light) vehicle.
  const showVehicleNote =
    quote?.vehicle &&
    !['bicycle', 'motorbike'].includes(quote.vehicle.type)

  return (
    <div className="min-h-screen pb-32" style={{ background: '#F8F8F8' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-100">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Delivery details */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Delivery details</h2>

          <label className="text-xs text-gray-500">Pickup from</label>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-3 mt-1 mb-3">
            <span className="text-green-500">↑</span>
            <span className="text-sm text-gray-500">{cart.vendorAddress}</span>
          </div>

          {/* Saved address chips */}
          {savedAddresses && savedAddresses.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-2 mt-1">
              {savedAddresses.map((addr) => (
                <button key={addr.id} type="button"
                  onClick={() => setDropoff(addr.address)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm active:scale-95 transition-transform"
                  style={dropoff === addr.address
                    ? { borderColor: '#00A651', background: '#EDFAF3', color: '#00A651' }
                    : { borderColor: '#E5E5E5', color: '#444' }
                  }>
                  <Icon name="location" size={16} />
                  <span className="font-semibold">{addr.label}</span>
                </button>
              ))}
            </div>
          )}

          <label className="text-xs text-gray-500">Deliver to <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            placeholder="e.g. 15 Borrowdale Rd, Harare"
            className="w-full mt-1 mb-3 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500"
          />

          {/* Location — GPS first, paste second, WhatsApp request third */}
          <label className="text-xs text-gray-500">Pin the exact drop-off (optional)</label>

          {/* Primary: use my current location */}
          {pinStatus === 'ok' ? (
            <div className="flex items-center justify-between mt-1 mb-2 px-4 py-3 rounded-xl"
              style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <div className="flex items-center gap-2">
                <Icon name="location" size={16} />
                <span className="text-sm font-semibold" style={{ color: '#16A34A' }}>
                  Location pinned
                </span>
                <span className="text-xs" style={{ color: '#15803D' }}>
                  ({pinCoords.lat.toFixed(4)}, {pinCoords.lng.toFixed(4)})
                </span>
              </div>
              <button type="button" onClick={clearPin} className="text-xs font-semibold" style={{ color: '#DC2626' }}>
                Change
              </button>
            </div>
          ) : (
            <>
              <button type="button" onClick={useCurrentLocation}
                disabled={pinStatus === 'loading'}
                className="w-full flex items-center justify-center gap-2 mt-1 mb-2 px-4 py-3 rounded-xl text-sm font-semibold text-white active:scale-98 transition-transform disabled:opacity-60"
                style={{ background: '#00A651' }}>
                <Icon name="location" size={16} />
                {pinStatus === 'loading' ? 'Getting location…' : 'Use my current location'}
              </button>

              {/* Secondary: paste a shared pin (auto-resolves) */}
              <input
                type="text"
                value={pinLink}
                onChange={(e) => onPinPaste(e.target.value)}
                placeholder="or paste a shared WhatsApp / Maps pin link"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500"
              />

              {/* Tertiary: ask someone via WhatsApp */}
              <button type="button" onClick={requestViaWhatsApp}
                className="w-full flex items-center justify-center gap-2 mt-2 mb-2 px-4 py-2.5 rounded-xl text-sm font-semibold active:scale-98 transition-transform"
                style={{ background: '#F0FDF4', color: '#128C7E', border: '1px solid #A7F3D0' }}>
                <Icon name="chat" size={16} />
                Request location via WhatsApp
              </button>
            </>
          )}
          {pinStatus === 'error' && (
            <p className="text-xs mb-2 text-red-500">{pinError}</p>
          )}
          {pinStatus === 'ok' && pinError && (
            <p className="text-xs mb-2" style={{ color: '#B45309' }}>{pinError}</p>
          )}

          {/* Landmark — human cue for unstructured Zim addresses */}
          <label className="text-xs text-gray-500 block mt-1">Landmark / directions (optional)</label>
          <input
            type="text"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="e.g. blue gate opposite Total garage, ask for tuckshop"
            className="w-full mt-1 mb-3 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500"
          />

          <label className="text-xs text-gray-500">Delivery instructions (optional)</label>
          <input
            type="text"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. Call when you arrive, gate code 1234"
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500"
          />
        </div>

        {/* Required vehicle note — materials / heavy loads */}
        {showVehicleNote && (
          <div className="flex items-start gap-3 p-3 rounded-xl border" style={{ borderColor: '#FFD9A0', background: '#FFF8EE' }}>
            <Icon name="vehicle" size={18} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#8A5A00' }}>
                This load needs a {quote.vehicle.name}
              </p>
              <p className="text-xs" style={{ color: '#A97A2E' }}>
                {quote.vehicle.hint} · total ~{totalWeight.toFixed(0)}kg
              </p>
            </div>
          </div>
        )}

        {/* Schedule */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-3">When to deliver</h2>
          <div className="flex gap-2 mb-2">
            <button type="button" onClick={() => setScheduleMode('now')}
              className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all active:scale-95"
              style={scheduleMode === 'now'
                ? { borderColor: '#00A651', background: '#EDFAF3', color: '#00A651' }
                : { borderColor: '#E5E5E5', color: '#444' }
              }>
              Deliver now
            </button>
            <button type="button" onClick={() => setScheduleMode('later')}
              className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all active:scale-95"
              style={scheduleMode === 'later'
                ? { borderColor: '#00A651', background: '#EDFAF3', color: '#00A651' }
                : { borderColor: '#E5E5E5', color: '#444' }
              }>
              Schedule for later
            </button>
          </div>
          {scheduleMode === 'later' && (
            <>
              <input
                type="datetime-local"
                value={scheduledFor}
                min={new Date(Date.now() + minLeadMinutes * 60 * 1000).toISOString().slice(0, 16)}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500"
              />
              <p className="text-xs text-gray-400 mt-2">
                {longestPrep > 30
                  ? `Some items need ~${longestPrep} min prep, so the earliest is ${minLeadMinutes} minutes from now.`
                  : "At least 30 minutes ahead, up to 7 days. We'll dispatch a rider close to your chosen time."}
              </p>
            </>
          )}
        </div>

        {/* Name your fare — materials/errands only (inDrive-style) */}
        {canNegotiate && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="text-sm font-bold text-gray-700">Name your fare</h2>
                <p className="text-xs text-gray-400 mt-0.5">Offer a price — riders accept or counter.</p>
              </div>
              <button type="button" onClick={() => setNameYourFare((v) => !v)}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ background: nameYourFare ? '#00A651' : '#D1D5DB' }}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                  style={{ left: nameYourFare ? '22px' : '2px' }} />
              </button>
            </div>

            {nameYourFare && (
              <div className="mt-3">
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200">
                  <span className="text-gray-400 font-bold">$</span>
                  <input
                    type="number" inputMode="decimal" value={offeredFare}
                    onChange={(e) => setOfferedFare(e.target.value)}
                    placeholder={quote ? deliveryFee.toFixed(2) : '0.00'}
                    className="flex-1 bg-transparent text-lg font-bold text-gray-900 outline-none"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {quote ? `Suggested fare ~$${deliveryFee.toFixed(2)} based on distance and load. ` : ''}
                  Riders nearby will see your offer and can accept or propose a different price.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tip the rider */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-1">Tip your rider</h2>
          <p className="text-xs text-gray-400 mb-3">100% goes to your rider. Optional, but appreciated.</p>
          <div className="flex gap-2">
            {[0, 1, 2, 5].map((amt) => (
              <button key={amt} type="button"
                onClick={() => { setTip(amt); setCustomTip('') }}
                className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all active:scale-95"
                style={tip === amt && customTip === ''
                  ? { borderColor: '#00A651', background: '#EDFAF3', color: '#00A651' }
                  : { borderColor: '#E5E5E5', color: '#444' }
                }>
                {amt === 0 ? 'No tip' : `$${amt}`}
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-400">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={customTip}
              onChange={(e) => {
                const v = e.target.value.replace(/[^\d.]/g, '')
                setCustomTip(v)
                setTip(v ? Math.max(0, parseFloat(v) || 0) : 0)
              }}
              placeholder="Custom amount"
              className="flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-green-500"
              style={{ borderColor: customTip ? '#00A651' : '#E5E5E5' }}
            />
          </div>
        </div>

        {/* Promo code */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Promo code</h2>
          {promoStatus === 'ok' && promo ? (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <div className="flex items-center gap-2">
                <Icon name="promo" size={16} />
                <span className="text-sm font-semibold" style={{ color: '#16A34A' }}>{promo.code}</span>
                <span className="text-xs" style={{ color: '#15803D' }}>
                  {promo.free_delivery ? 'Free delivery' : `−$${promo.discount_usd.toFixed(2)}`}
                </span>
              </div>
              <button type="button" onClick={removePromo} className="text-xs font-semibold" style={{ color: '#DC2626' }}>
                Remove
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoStatus(''); setPromoError('') }}
                  placeholder="Enter code"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 uppercase"
                />
                <button type="button" onClick={applyPromo}
                  disabled={!promoInput.trim() || promoStatus === 'loading'}
                  className="px-5 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: '#00A651' }}>
                  {promoStatus === 'loading' ? '…' : 'Apply'}
                </button>
              </div>
              {promoStatus === 'error' && (
                <p className="text-xs mt-2 text-red-500">{promoError}</p>
              )}
            </>
          )}
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Payment method</h2>
          <div className="flex flex-col gap-2">
            {PAYMENT_METHODS.map((method) => (
              <label key={method.id}
                className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                style={paymentMethod === method.id
                  ? { borderColor: '#00A651', background: '#EDFAF3' }
                  : { borderColor: '#E5E5E5' }
                }>
                <input type="radio" name="payment" value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ accentColor: '#00A651' }}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{method.label}</p>
                  <p className="text-xs text-gray-400">{method.sub}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Payment details — mobile money */}
          {needsPhone && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="text-xs text-gray-500">Mobile money number <span className="text-red-500">*</span></label>
              <input
                type="tel"
                value={paymentDetails.phone || ''}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, phone: e.target.value })}
                placeholder="07X XXX XXXX"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500"
              />
              <p className="text-xs text-gray-400 mt-2">
                You'll receive a prompt on your phone to approve payment
              </p>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Order summary</h2>
          {cart.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{item.name} × {item.qty}</span>
              <span>${(item.unit_price_usd * item.qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 mt-3 pt-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Delivery fee</span>
              <span>
                {quoteLoading && !quote ? '…'
                  : quoteError ? '—'
                  : `$${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            {tip > 0 && (
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Rider tip</span>
                <span>${tip.toFixed(2)}</span>
              </div>
            )}
            {quote?.discount_usd > 0 && (
              <div className="flex justify-between text-sm mb-2" style={{ color: '#16A34A' }}>
                <span>Discount {promo?.code ? `(${promo.code})` : ''}</span>
                <span>−${quote.discount_usd.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-gray-900 text-base">
              <span>Total</span>
              <span>
                {quoteLoading && !quote ? '…' : `$${total.toFixed(2)}`}
              </span>
            </div>
            {quoteError && (
              <p className="text-xs text-amber-600 mt-2">
                Couldn't fetch live delivery fee — final amount confirmed after you place the order.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Place order */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-30">
        <button onClick={handleSubmit} disabled={loading}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-white font-bold active:scale-98 transition-transform disabled:opacity-70"
          style={{ background: '#00A651', boxShadow: '0 8px 24px #00A65150' }}>
          <span>{loading ? 'Placing order...' : (scheduleMode === 'later' ? 'Schedule order' : 'Place order')}</span>
          <span>{quote ? `$${total.toFixed(2)}` : `$${subtotal.toFixed(2)}`}</span>
        </button>
      </div>
    </div>
  )
}
