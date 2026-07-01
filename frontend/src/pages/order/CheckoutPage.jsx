import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { orderAPI } from '../../api/api'
import useCartStore from '../../store/useCartStore'
import useAuthStore from '../../store/useAuthStore'
import api from '../../api/api'
import Button from '../../components/ui/Button'

const PAYMENT_METHODS = [
  { id: 'ecocash',    label: 'EcoCash',    sub: 'Econet mobile money' },
  { id: 'onemoney',   label: 'OneMoney',   sub: 'NetOne mobile money' },
  { id: 'innbucks',   label: 'InnBucks',   sub: 'InnBucks wallet' },
  { id: 'zipit',      label: 'ZIPIT',      sub: 'Bank transfer (USD)' },
  { id: 'visa',       label: 'Visa',       sub: 'Card payment' },
  { id: 'mastercard', label: 'Mastercard', sub: 'Card payment' },
]

// Build category-specific order detail
function buildDetail(cart) {
  const items = cart.items.map((i) => ({
    menu_item_id:   i.id,
    name:           i.name,
    qty:            i.qty,
    unit_price_usd: i.unit_price_usd,
    special_instructions: i.special_instructions,
  }))

  const base = { items }

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
  const [instructions, setInstructions]   = useState('')
  const [paymentMethod, setPaymentMethod] = useState('ecocash')
  const [paymentDetails, setPaymentDetails] = useState({})
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')

  // Mobile money methods need a phone number; cards need card details
  const MOBILE_MONEY = ['ecocash', 'onemoney', 'innbucks', 'omari']
  const CARDS        = ['visa', 'mastercard']
  const needsPhone   = MOBILE_MONEY.includes(paymentMethod)
  const needsCard    = CARDS.includes(paymentMethod)

  const subtotal = cart.totalPrice()
  const weight   = cart.totalWeight()

  // Simple delivery fee estimate by weight
  const deliveryFee = weight < 20 ? 2.50 : weight < 500 ? 8.00 : 25.00
  const total       = subtotal + deliveryFee

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!dropoff.trim()) {
      setError('Please enter your delivery address')
      return
    }
    if (needsPhone && !paymentDetails.phone) {
      setError('Please enter your mobile money number')
      return
    }
    if (needsCard && (!paymentDetails.cardNumber || !paymentDetails.expiry || !paymentDetails.cvv)) {
      setError('Please enter your card details')
      return
    }

    setLoading(true)
    try {
      const orderData = {
        category_type:   cart.categoryType,
        city:            'harare',
        pickup_address:  cart.vendorAddress,
        dropoff_address: dropoff,
        payment_method:  paymentMethod,
        payment_details: paymentDetails,
        special_instructions: instructions || null,
        detail: buildDetail(cart),
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
                    ? { borderColor: '#FF3008', background: '#FFF0EE', color: '#FF3008' }
                    : { borderColor: '#E5E5E5', color: '#444' }
                  }>
                  <span>📍</span>
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
            className="w-full mt-1 mb-3 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400"
          />

          <label className="text-xs text-gray-500">Delivery instructions (optional)</label>
          <input
            type="text"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. Call when you arrive, gate code 1234"
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400"
          />
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Payment method</h2>
          <div className="flex flex-col gap-2">
            {PAYMENT_METHODS.map((method) => (
              <label key={method.id}
                className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                style={paymentMethod === method.id
                  ? { borderColor: '#FF3008', background: '#FFF0EE' }
                  : { borderColor: '#E5E5E5' }
                }>
                <input type="radio" name="payment" value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ accentColor: '#FF3008' }}
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
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400"
              />
              <p className="text-xs text-gray-400 mt-2">
                You'll receive a prompt on your phone to approve payment
              </p>
            </div>
          )}

          {/* Payment details — card */}
          {needsCard && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500">Card number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={paymentDetails.cardNumber || ''}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 16)
                    const formatted = v.replace(/(\d{4})(?=\d)/g, '$1 ')
                    setPaymentDetails({ ...paymentDetails, cardNumber: formatted })
                  }}
                  placeholder="1234 5678 9012 3456"
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Expiry <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={paymentDetails.expiry || ''}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                      if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2)
                      setPaymentDetails({ ...paymentDetails, expiry: v })
                    }}
                    placeholder="MM/YY"
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">CVV <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={paymentDetails.cvv || ''}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    placeholder="123"
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentDetails.saveCard || false}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, saveCard: e.target.checked })}
                  style={{ accentColor: '#FF3008' }}
                />
                <span className="text-xs text-gray-600">Save this card for future orders</span>
              </label>
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
              <span>Delivery fee</span><span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-gray-900 text-base">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Place order */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-30">
        <button onClick={handleSubmit} disabled={loading}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-white font-bold active:scale-98 transition-transform disabled:opacity-70"
          style={{ background: '#FF3008', boxShadow: '0 8px 24px #FF300850' }}>
          <span>{loading ? 'Placing order...' : 'Place order'}</span>
          <span>${total.toFixed(2)}</span>
        </button>
      </div>
    </div>
  )
}
