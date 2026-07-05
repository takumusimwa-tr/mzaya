import { useState } from 'react'
import useCartStore from '../store/useCartStore'
import imageUrl from '../utils/imageUrl'

export default function ItemModal({ item, vendor, onClose }) {
  const cart = useCartStore()
  const [qty, setQty]                   = useState(1)
  const [instructions, setInstructions] = useState('')
  const [adding, setAdding]             = useState(false)

  const unitPrice = Number(item.price_usd)
  const total     = unitPrice * qty

  // Context-aware placeholder by category
  const placeholders = {
    food:      'e.g. No onions, extra spicy...',
    grocery:   'e.g. Ripe ones please, no substitutes',
    materials: 'e.g. Specific brand, deliver to site',
    errand:    'e.g. Any special handling notes',
  }
  const placeholder = placeholders[vendor.category] || 'Any special requests...'  

  const handleAdd = () => {
    setAdding(true)
    cart.addItem({
      id:                   item.id,
      name:                 item.name,
      unit_price_usd:       unitPrice,
      qty,
      special_instructions: instructions || null,
      weight_kg:            item.weight_kg || 0.5,
      prep_minutes:         item.prep_minutes || 0,
    }, {
      vendorId:      vendor.id,
      vendorName:    vendor.name,
      vendorAddress: vendor.address,
      vendorCity:    vendor.city?.name ? vendor.city.name.toLowerCase() : null,
      categoryType:  vendor.category,
    })
    setTimeout(() => { setAdding(false); onClose() }, 200)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-3xl flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '85vh' }}>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Image header */}
          <div className="relative h-48 bg-gray-100 flex items-center justify-center">
            {item.image_url
              ? <img src={imageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" />
              : <span className="text-6xl opacity-30">🍽️</span>
            }
            <button onClick={onClose}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md active:scale-95">
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Details */}
          <div className="p-5">
            <h2 className="text-xl font-black text-gray-900">{item.name}</h2>
            {item.description && (
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{item.description}</p>
            )}
            <p className="text-lg font-black text-gray-900 mt-3">${unitPrice.toFixed(2)}</p>

            <div className="mt-5">
              <label className="text-sm font-bold text-gray-700">Special instructions</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={placeholder}
                rows={2}
                className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Fixed footer — always visible */}
        <div className="p-4 border-t border-gray-100 flex items-center gap-3 bg-white flex-shrink-0">
          <div className="flex items-center gap-3 bg-gray-100 rounded-full px-2 py-1.5">
            <button onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm active:scale-90">
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
            </button>
            <span className="font-black text-gray-900 w-6 text-center">{qty}</span>
            <button onClick={() => setQty(qty + 1)}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm active:scale-90">
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <button onClick={handleAdd}
            disabled={adding}
            className="flex-1 flex items-center justify-between px-5 py-3.5 rounded-2xl text-white font-bold active:scale-98 transition-transform disabled:opacity-70"
            style={{ background: '#FF3008' }}>
            <span>{adding ? 'Added!' : 'Add to cart'}</span>
            <span>${total.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
