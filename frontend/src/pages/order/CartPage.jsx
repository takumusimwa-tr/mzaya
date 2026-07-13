import { useNavigate } from 'react-router-dom'
import useCartStore from '../../store/useCartStore'
import Icon from '../../components/ui/Icon'

export default function CartPage() {
  const navigate = useNavigate()
  const cart     = useCartStore()

  const items      = cart.items
  const subtotal   = cart.totalPrice()
  const totalItems = cart.totalItems()

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F8F8F8' }}>
        <div className="flex items-center gap-3 px-4 pt-14 pb-4 bg-white border-b border-gray-100">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-100">
            <BackIcon />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Cart</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="mb-4 flex justify-center text-gray-300"><Icon name="grocery" size={56} /></div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Your cart is empty</h2>
          <p className="text-gray-400 text-sm text-center mb-6">Add items from a vendor to get started</p>
          <button onClick={() => navigate('/home')}
            className="px-8 py-3 rounded-2xl text-white font-bold active:scale-95"
            style={{ background: '#00A651' }}>
            Browse vendors
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32" style={{ background: '#F8F8F8' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-100">
          <BackIcon />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Your cart</h1>
          <p className="text-xs text-gray-400">{cart.vendorName}</p>
        </div>
        <button onClick={() => cart.clearCart()}
          className="ml-auto text-xs text-red-500 font-semibold">
          Clear
        </button>
      </div>

      {/* Items */}
      <div className="px-4 mt-4 flex flex-col gap-3">
        {items.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 border border-gray-100"
            style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                {item.special_instructions && (
                  <p className="text-xs text-gray-400 mt-0.5"><Icon name="note" size={12} className="inline" /> {item.special_instructions}</p>
                )}
                <p className="text-sm font-black text-gray-900 mt-1">
                  ${(item.unit_price_usd * item.qty).toFixed(2)}
                </p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1.5 py-1">
                <button onClick={() => item.qty > 1 ? cart.updateQty(index, item.qty - 1) : cart.removeItem(index)}
                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm active:scale-90">
                  {item.qty > 1
                    ? <svg className="w-3.5 h-3.5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                    : <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  }
                </button>
                <span className="font-black text-gray-900 w-5 text-center text-sm">{item.qty}</span>
                <button onClick={() => cart.updateQty(index, item.qty + 1)}
                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm active:scale-90">
                  <svg className="w-3.5 h-3.5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add more */}
        <button onClick={() => navigate(`/vendor/${cart.vendorId}`)}
          className="text-center py-3 text-sm font-semibold rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 active:bg-gray-50">
          + Add more items
        </button>
      </div>

      {/* Summary */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Subtotal ({totalItems} items)</span>
            <span className="font-semibold">US${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Delivery fee</span>
            <span>Calculated at checkout</span>
          </div>
        </div>
      </div>

      {/* Checkout bar */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-30">
        <button onClick={() => navigate('/checkout')}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-white font-bold active:scale-98 transition-transform"
          style={{ background: '#00A651', boxShadow: '0 8px 24px #00A65150' }}>
          <span>Go to checkout</span>
          <span>US${subtotal.toFixed(2)}</span>
        </button>
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
