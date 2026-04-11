import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderAPI } from '../../api/api'
import useCartStore from '../../store/useCartStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const PAYMENT_METHODS = [
  { id: 'ecocash',    label: 'EcoCash',    sub: 'Econet mobile money' },
  { id: 'onemoney',   label: 'OneMoney',   sub: 'NetOne mobile money' },
  { id: 'innbucks',   label: 'InnBucks',   sub: 'InnBucks wallet' },
  { id: 'zipit',      label: 'ZIPIT',      sub: 'Bank transfer (USD)' },
  { id: 'visa',       label: 'Visa',       sub: 'Card payment (USD)' },
  { id: 'mastercard', label: 'Mastercard', sub: 'Card payment (USD)' },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const {
    items, vendor, vendorName, vendorAddress,
    categoryType, city, totalUsd, clearCart,
  } = useCartStore()

  const [form, setForm] = useState({
    dropoff_address:      '',
    payment_method:       'ecocash',
    special_instructions: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.dropoff_address) {
      setError('Please enter your delivery address')
      return
    }
    setLoading(true)
    try {
      const orderData = {
        category_type:   categoryType,
        city:            city || 'harare',
        pickup_address:  vendorAddress || vendorName,
        dropoff_address: form.dropoff_address,
        payment_method:  form.payment_method,
        detail: {
          restaurant_id:        vendor,
          restaurant_name:      vendorName,
          store_id:             vendor,
          store_name:           vendorName,
          supplier_id:          vendor,
          supplier_name:        vendorName,
          items: items.map((i) => ({
            name:           i.name,
            qty:            i.qty,
            unit_price_usd: i.price_usd,
          })),
          special_instructions: form.special_instructions || null,
        },
      }

      const { data } = await orderAPI.place(orderData)
      clearCart()
      navigate(`/orders/${data.order.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-48">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-100">
          <BackIcon />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 flex flex-col gap-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Addresses */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-gray-700">Delivery details</h2>

          {/* Pickup — auto-filled, read only */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Pickup from</label>
            <div className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-500 flex items-center gap-2">
              <span className="text-green-500">↑</span>
              <span>{vendorAddress || vendorName || 'Vendor location'}</span>
            </div>
          </div>

          {/* Dropoff — customer fills this */}
          <Input
            label="Deliver to"
            name="dropoff_address"
            value={form.dropoff_address}
            onChange={handleChange}
            placeholder="e.g. 15 Borrowdale Rd, Harare"
            required
          />

          <Input
            label="Special instructions (optional)"
            name="special_instructions"
            value={form.special_instructions}
            onChange={handleChange}
            placeholder="e.g. Call when you arrive, gate code 1234"
          />
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Payment method</h2>
          <div className="flex flex-col gap-2">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                  ${form.payment_method === method.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                  }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={method.id}
                  checked={form.payment_method === method.id}
                  onChange={handleChange}
                  className="accent-green-600"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{method.label}</p>
                  <p className="text-xs text-gray-400">{method.sub}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Order summary</h2>
          <p className="text-xs text-gray-500 mb-3 font-medium">{vendorName}</p>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{item.name} × {item.qty}</span>
              <span>${(item.price_usd * item.qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold text-gray-900">
            <span>Subtotal</span>
            <span>${totalUsd().toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">+ delivery fee calculated on placement</p>
        </div>
      </form>

      {/* Place order button — sits above bottom nav */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-4 bg-gradient-to-t from-white via-white to-transparent pt-4">
        <Button size="lg" loading={loading} onClick={handleSubmit}>
          Place order · ${totalUsd().toFixed(2)}
        </Button>
      </div>
    </div>
  )
}

function BackIcon() {
  return (
    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}
