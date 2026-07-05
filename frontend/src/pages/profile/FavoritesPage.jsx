import { useNavigate } from 'react-router-dom'
import { useFavoriteVendors, useFavoriteIds } from '../../hooks/useFavorites'
import imageUrl from '../../utils/imageUrl'
import LoadingScreen from '../../components/ui/LoadingScreen'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const { data: vendors, isLoading } = useFavoriteVendors()
  const { toggle } = useFavoriteIds()

  if (isLoading) return <LoadingScreen message="Loading favorites..." />

  return (
    <div className="min-h-screen pb-28" style={{ background: '#F8F8F8' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-100">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">Your favorites</h1>
      </div>

      {!vendors || vendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 pt-24">
          <div className="text-6xl mb-4">❤️</div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">No favorites yet</h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            Tap the heart on any vendor to save it here for quick reordering
          </p>
          <button onClick={() => navigate('/home')}
            className="px-8 py-3 rounded-2xl text-white font-bold active:scale-95"
            style={{ background: '#00A651' }}>
            Browse vendors
          </button>
        </div>
      ) : (
        <div className="px-4 mt-4 flex flex-col gap-4">
          {vendors.map((vendor) => (
            <button key={vendor.id}
              onClick={() => navigate(`/vendor/${vendor.id}`)}
              className="w-full text-left bg-white rounded-2xl overflow-hidden active:scale-98 transition-transform"
              style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <div className="relative h-40 overflow-hidden bg-gray-100">
                {vendor.cover_url
                  ? <img src={imageUrl(vendor.cover_url)} alt={vendor.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8)' }}>
                      <span className="text-5xl opacity-20">🏪</span>
                    </div>
                }
                <button
                  onClick={(e) => { e.stopPropagation(); toggle(vendor.id) }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm active:scale-90">
                  <svg className="w-4 h-4" fill="#00A651" stroke="#00A651" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <div className="absolute bottom-3 left-3 w-11 h-11 bg-white rounded-xl shadow-md flex items-center justify-center border border-gray-100">
                  {vendor.logo_url
                    ? <img src={imageUrl(vendor.logo_url)} alt="" className="w-full h-full object-cover rounded-xl" />
                    : <span className="text-lg font-black text-gray-500">{vendor.name?.charAt(0)}</span>
                  }
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-gray-900">{vendor.name}</h3>
                  {vendor.is_open
                    ? <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Open</span>
                    : <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Closed</span>
                  }
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-gray-600">⭐ {Number(vendor.rating || 0).toFixed(1)}</span>
                  <span className="text-gray-200">·</span>
                  <span className="text-xs text-gray-500">15–25 min</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{vendor.address}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
