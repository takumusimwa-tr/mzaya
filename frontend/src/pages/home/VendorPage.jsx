import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { vendorAPI } from '../../api/api'
import useCartStore from '../../store/useCartStore'
import LoadingScreen from '../../components/ui/LoadingScreen'
import ItemModal from '../../components/ItemModal'
import imageUrl from '../../utils/imageUrl'
import { useFavoriteIds } from '../../hooks/useFavorites'

export default function VendorPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const cart     = useCartStore()
  const [activeItem, setActiveItem] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const { isFavorite, toggle } = useFavoriteIds()

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', id],
    queryFn:  () => vendorAPI.getById(id).then((r) => r.data.vendor),
  })

  // If arrived from a product tap (?highlight=itemId), auto-open that item.
  useEffect(() => {
    if (!highlightId || !vendor?.menuItems) return
    const item = vendor.menuItems.find((i) => i.id === highlightId)
    if (item) setActiveItem(item)
  }, [highlightId, vendor])

  if (isLoading) return <LoadingScreen message="Loading menu..." />
  if (!vendor)   return <div className="p-6 text-center text-gray-500">Vendor not found</div>

  const menuItems = vendor.menuItems || []
  const cartCount = cart.totalItems()
  const cartTotal = cart.totalPrice()

  // Group menu by category
  const grouped = menuItems.reduce((acc, item) => {
    const cat = item.category || 'Menu'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})
  const categories = Object.keys(grouped)

  return (
    <div className="min-h-screen pb-28" style={{ background: '#fff' }}>

      {/* ── Hero cover ── */}
      <div className="relative h-52">
        {vendor.cover_url
          ? <img src={imageUrl(vendor.cover_url)} alt={vendor.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #FF6B00, #00A651)' }} />
        }
        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md active:scale-95">
          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {/* Favorite toggle */}
        <button onClick={() => toggle(vendor.id)}
          className="absolute top-12 right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md active:scale-90 transition-transform">
          <svg className="w-5 h-5 transition-colors"
            fill={isFavorite(vendor.id) ? '#00A651' : 'none'}
            stroke={isFavorite(vendor.id) ? '#00A651' : '#1f2937'}
            strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* ── Vendor info card ── */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 -mt-8 border-4 border-white shadow-sm">
              {vendor.logo_url
                ? <img src={imageUrl(vendor.logo_url)} alt="" className="w-full h-full object-cover rounded-lg" />
                : <span className="text-xl font-black text-gray-500">{vendor.name?.charAt(0)}</span>
              }
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-black text-gray-900">{vendor.name}</h1>
              <p className="text-xs text-gray-400 mt-0.5">{vendor.address}</p>
            </div>
          </div>

          {/* Info bar */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-gray-900">⭐ {Number(vendor.rating || 0).toFixed(1)}</span>
            </div>
            <div className="text-xs text-gray-500">15–25 min</div>
            <div className="text-xs text-gray-500">$2–4 delivery</div>
            <div className={`text-xs font-semibold ml-auto ${vendor.is_open ? 'text-green-600' : 'text-red-500'}`}>
              {vendor.is_open ? '● Open' : '○ Closed'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category nav (sticky) ── */}
      {categories.length > 1 && (
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 mt-4 px-4 py-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button key={cat}
                onClick={() => {
                  setActiveCategory(cat)
                  document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                style={activeCategory === cat
                  ? { background: '#00A651', color: '#fff' }
                  : { background: '#F2F2F2', color: '#666' }
                }>
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Menu ── */}
      <div className="px-4 mt-4">
        {!vendor.is_open && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-center">
            <p className="text-sm text-red-600 font-medium">This vendor is currently closed</p>
            <p className="text-xs text-red-400 mt-0.5">You can browse but not order right now</p>
          </div>
        )}

        {categories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-gray-500 text-sm">No menu items available yet</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat} id={`cat-${cat}`} className="mb-6 scroll-mt-16">
              <h2 className="text-lg font-black text-gray-900 mb-3">{cat}</h2>
              <div className="flex flex-col gap-3">
                {grouped[cat].map((item) => (
                  <button key={item.id}
                    onClick={() => vendor.is_open && setActiveItem(item)}
                    disabled={!vendor.is_open}
                    className="w-full text-left bg-white rounded-2xl border border-gray-100 overflow-hidden flex active:scale-98 transition-transform disabled:opacity-60"
                    style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                    <div className="flex-1 p-4">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      {item.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-sm font-black text-gray-900">${Number(item.price_usd).toFixed(2)}</p>
                        {item.prep_minutes > 0 && (
                          <span className="text-[11px] text-gray-400">· Ready in ~{item.prep_minutes} min</span>
                        )}
                      </div>
                    </div>
                    {/* Item image */}
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 flex items-center justify-center relative">
                      {item.image_url
                        ? <img src={imageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" />
                        : <span className="text-3xl opacity-30">🍽️</span>
                      }
                      {vendor.is_open && (
                        <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
                          <svg className="w-4 h-4" style={{ color: '#00A651' }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Floating cart bar ── */}
      {cartCount > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-30">
          <button onClick={() => navigate('/cart')}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-white font-bold active:scale-98 transition-transform"
            style={{ background: '#00A651', boxShadow: '0 8px 24px #00A65150' }}>
            <span className="flex items-center gap-2">
              <span className="bg-white/25 w-6 h-6 rounded-full flex items-center justify-center text-sm">{cartCount}</span>
              View cart
            </span>
            <span>${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* ── Item modal ── */}
      {activeItem && (
        <ItemModal
          item={activeItem}
          vendor={vendor}
          onClose={() => setActiveItem(null)}
        />
      )}
    </div>
  )
}
