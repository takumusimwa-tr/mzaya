import { useNavigate } from 'react-router-dom'
import useCartStore from '../../store/useCartStore'
import Button from '../../components/ui/Button'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, vendorName, addItem, removeItem, clearCart, totalItems, totalUsd, vendor, categoryType, city } = useCartStore()

  if (!items.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-5xl">🛒</p>
        <p className="text-gray-600 font-semibold">Your cart is empty</p>
        <p className="text-gray-400 text-sm text-center">Add items from a vendor to get started</p>
        <Button onClick={() => navigate('/')}>Browse vendors</Button>
      </div>
    )
  }

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-100">
          <BackIcon />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Your cart</h1>
          <p className="text-xs text-gray-500">{vendorName}</p>
        </div>
      </div>

      {/* Items */}
      <div className="px-4 flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
              <p className="text-green-600 font-bold text-sm mt-0.5">${(item.price_usd * item.qty).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => removeItem(item.id)}
                className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold active:scale-95"
              >
                −
              </button>
              <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
              <button
                onClick={() => addItem(item, vendor, vendorName, categoryType, city)}
                className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold active:scale-95"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Subtotal</span>
          <span>${totalUsd().toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-400 mb-3">
          <span>Delivery fee</span>
          <span>Calculated at checkout</span>
        </div>
        <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span>${totalUsd().toFixed(2)}+</span>
        </div>
      </div>

      {/* Clear cart */}
      <button
        onClick={clearCart}
        className="mx-4 mt-3 text-sm text-red-500 underline"
      >
        Clear cart
      </button>

      {/* Checkout button */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-4 bg-gradient-to-t from-white via-white to-transparent pt-4">
        <Button size="lg" onClick={() => navigate('/checkout')}>
          Proceed to checkout · {totalItems()} items
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
