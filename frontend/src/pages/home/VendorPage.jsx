import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { vendorAPI } from '../../api/api'
import useCartStore from '../../store/useCartStore'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Button from '../../components/ui/Button'

export default function VendorPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { addItem, removeItem, items, vendor: cartVendor, totalItems, totalUsd } = useCartStore()

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', id],
    queryFn:  () => vendorAPI.getById(id).then((r) => r.data.vendor),
  })

  if (isLoading) return <LoadingScreen message="Loading menu..." />
  if (!vendor)   return <div className="p-6 text-center text-gray-500">Vendor not found</div>

  const getItemQty = (itemId) => items.find((i) => i.id === itemId)?.qty || 0

  const grouped = (vendor.menuItems || []).reduce((acc, item) => {
    const cat = item.category || 'Menu'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-green-500 to-green-700 h-48 flex items-end">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 bg-white/20 p-2 rounded-full"
        >
          <BackIcon />
        </button>
        <div className="p-4 text-white">
          <h1 className="text-xl font-bold">{vendor.name}</h1>
          <p className="text-green-100 text-xs mt-0.5">{vendor.address}</p>
          <span className={`text-xs font-medium mt-1 inline-block ${vendor.is_open ? 'text-green-200' : 'text-red-300'}`}>
            {vendor.is_open ? '● Open now' : '● Closed'}
          </span>
        </div>
      </div>

      {/* Warning if switching vendor */}
      {cartVendor && cartVendor !== id && totalItems() > 0 && (
        <div className="mx-4 mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-xs text-yellow-800">Adding items from this vendor will clear your current cart</p>
        </div>
      )}

      {/* Menu */}
      <div className="px-4 mt-4">
        {!vendor.menuItems?.length ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500 text-sm">Menu not available yet</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, menuItems]) => (
            <div key={category} className="mb-6">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">{category}</h2>
              <div className="flex flex-col gap-3">
                {menuItems.map((item) => {
                  const qty = getItemQty(item.id)
                  return (
                    <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>
                        )}
                        <p className="text-green-600 font-bold mt-1 text-sm">${Number(item.price_usd).toFixed(2)}</p>
                      </div>
                      {qty === 0 ? (
                        <button
                          onClick={() => addItem(item, id, vendor.name, vendor.category, 'harare', vendor.address)}
                          className="flex-shrink-0 bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold shadow-sm active:scale-95"
                        >
                          +
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="bg-gray-100 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold active:scale-95"
                          >
                            −
                          </button>
                          <span className="text-sm font-bold text-gray-900 w-4 text-center">{qty}</span>
                          <button
                            onClick={() => addItem(item, id, vendor.name, vendor.category, 'harare', vendor.address)}
                            className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart bar */}
      {totalItems() > 0 && cartVendor === id && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-4 bg-gradient-to-t from-white via-white to-transparent pt-4">
          <Button size="lg" onClick={() => navigate('/cart')}>
            View cart · {totalItems()} items · ${totalUsd().toFixed(2)}
          </Button>
        </div>
      )}
    </div>
  )
}

function BackIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}
