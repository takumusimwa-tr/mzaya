import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { vendorAPI } from '../../api/api'
import useAuthStore from '../../store/useAuthStore'
import useCartStore from '../../store/useCartStore'
import useLocation from '../../hooks/useLocation'
import LoadingScreen from '../../components/ui/LoadingScreen'
import imageUrl from '../../utils/imageUrl'
import { useFavoriteIds } from '../../hooks/useFavorites'

const CATEGORIES = [
  { id: 'food',      label: 'Food',      emoji: '🍽️' },
  { id: 'grocery',   label: 'Grocery',   emoji: '🛒' },
  { id: 'materials', label: 'Materials', emoji: '🏗️' },
  { id: 'errand',    label: 'Errands',   emoji: '📋' },
]

const TAGS = {
  food:      [{ label: 'Fast Food', emoji: '🍟' }, { label: 'Sadza', emoji: '🍲' }, { label: 'Chicken', emoji: '🍗' }, { label: 'Pizza', emoji: '🍕' }, { label: 'Burgers', emoji: '🍔' }, { label: 'Braai', emoji: '🔥' }, { label: 'Breakfast', emoji: '🍳' }, { label: 'Healthy', emoji: '🥗' }],
  grocery:   [{ label: 'Fresh Produce', emoji: '🥬' }, { label: 'Dairy', emoji: '🥛' }, { label: 'Beverages', emoji: '🥤' }, { label: 'Snacks', emoji: '🍪' }, { label: 'Bakery', emoji: '🍞' }, { label: 'Meats', emoji: '🥩' }],
  materials: [{ label: 'Cement', emoji: '🏗️' }, { label: 'Steel', emoji: '⚙️' }, { label: 'Timber', emoji: '🪵' }, { label: 'Paint', emoji: '🎨' }, { label: 'Plumbing', emoji: '🔧' }, { label: 'Electrical', emoji: '⚡' }],
}

export default function HomePage() {
  const user       = useAuthStore((s) => s.user)
  const totalItems = useCartStore((s) => s.totalItems())
  const navigate   = useNavigate()
  const [category, setCategory] = useState('food')
  const [search,   setSearch]   = useState('')
  const [focused,  setFocused]  = useState(false)

  const { isFavorite, toggle } = useFavoriteIds()
  const { city, loading: locLoading } = useLocation()
  const [selectedCity, setSelectedCity] = useState(null)
  useEffect(() => { if (city && !selectedCity) setSelectedCity(city) }, [city])

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors', category, selectedCity?.id],
    queryFn:  () => vendorAPI.list({ category, city_id: selectedCity?.id }).then((r) => r.data.vendors),
    enabled:  category !== 'errand' && !!selectedCity,
  })

  const filtered = (vendors || []).filter((v) =>
    !search || v.name.toLowerCase().includes(search.toLowerCase())
  )

  if (locLoading) return <LoadingScreen message="Finding vendors near you..." />

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const currentTags = TAGS[category] || []

  return (
    <div className="min-h-screen pb-28" style={{ background: '#F8F8F8' }}>

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-white px-4 pt-12 pb-3"
        style={{ boxShadow: '0 1px 0 #F0F0F0' }}>
        <div className="flex items-center justify-between">

          {/* Mzaya logo wordmark */}
          <div className="flex items-center gap-1">
            <span className="font-black text-2xl tracking-tight" style={{ color: '#FF3008' }}>
              mzaya
            </span>
            {selectedCity && (
              <span className="text-xs text-gray-400 font-medium ml-1 mt-0.5">
                · {selectedCity.name}
              </span>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </button>
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </button>
            <button onClick={() => navigate('/cart')}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center relative active:bg-gray-200">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                  style={{ background: '#FF3008', fontSize: 9 }}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Greeting + Search ── */}
      <div className="px-4 pt-4 pb-4 bg-white border-b border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 mb-3">
          {greeting}, {user?.name?.split(' ')[0]}! 👋
        </h2>
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${focused ? 'ring-2 ring-red-400' : ''}`}
          style={{ background: '#F2F2F2' }}>
          <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search restaurants, stores..."
            className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 text-xl leading-none">×</button>
          )}
        </div>
      </div>

      {/* ── Category tabs ── */}
      <div className="bg-white px-4 pt-4 pb-4 border-b border-gray-100">
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button key={cat.id}
              onClick={() => {
                setCategory(cat.id)
                setSearch('')
                if (cat.id === 'errand') navigate('/errand')
              }}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 active:opacity-70">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all"
                style={{
                  background: category === cat.id ? '#FF3008' : '#F5F5F5',
                  boxShadow: category === cat.id ? '0 4px 12px #FF300840' : 'none',
                  transform: category === cat.id ? 'scale(1.05)' : 'scale(1)',
                }}>
                {cat.emoji}
              </div>
              <span className="text-xs font-semibold transition-colors"
                style={{ color: category === cat.id ? '#FF3008' : '#888' }}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Discovery tags ── */}
      {currentTags.length > 0 && !search && (
        <div className="px-4 pt-4 pb-1">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {currentTags.map((tag) => (
              <button key={tag.label}
                onClick={() => setSearch(tag.label)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-gray-200 active:bg-gray-50"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <span className="text-sm">{tag.emoji}</span>
                <span className="text-xs font-semibold text-gray-700">{tag.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Vendor list ── */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-black text-gray-900">
            {search
              ? `"${search}"`
              : `${CATEGORIES.find(c => c.id === category)?.label} near you`
            }
          </h3>
          {filtered.length > 0 && (
            <span className="text-xs text-gray-400">{filtered.length} place{filtered.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse"
                style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                <div className="h-44 bg-gray-200" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl"
            style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <div className="text-5xl mb-3">🏪</div>
            <p className="font-bold text-gray-800 mb-1">
              {search ? 'No results found' : 'No vendors here yet'}
            </p>
            <p className="text-gray-400 text-sm">
              {search ? 'Try a different search' : 'New vendors coming soon'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor}
                onClick={() => navigate(`/vendor/${vendor.id}`)}
                isFavorite={isFavorite(vendor.id)}
                onToggleFavorite={() => toggle(vendor.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function VendorCard({ vendor, onClick, isFavorite, onToggleFavorite }) {
  return (
    <button onClick={onClick}
      className="w-full text-left bg-white rounded-2xl overflow-hidden active:scale-98 transition-transform"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>

      {/* Cover */}
      <div className="relative h-44 overflow-hidden bg-gray-100">
        {vendor.cover_url
          ? <img src={imageUrl(vendor.cover_url)} alt={vendor.name} className="w-full h-full object-cover" />
          : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8)' }}>
              <span className="text-6xl opacity-20">🏪</span>
            </div>
          )
        }

        {!vendor.is_open && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-black text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200">
              Closed
            </span>
          </div>
        )}

        {/* Favorite heart */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.() }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <svg className="w-4 h-4 transition-colors"
            fill={isFavorite ? '#FF3008' : 'none'}
            stroke={isFavorite ? '#FF3008' : '#6b7280'}
            strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Logo */}
        <div className="absolute bottom-3 left-3 w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center border border-gray-100">
          {vendor.logo_url
            ? <img src={imageUrl(vendor.logo_url)} alt="" className="w-full h-full object-cover rounded-xl" />
            : <span className="text-lg font-black text-gray-500">{vendor.name?.charAt(0)}</span>
          }
        </div>
      </div>

      {/* Info */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between">
          <h3 className="font-black text-gray-900 text-base">{vendor.name}</h3>
          {vendor.is_open && (
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Open</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-semibold text-gray-600">⭐ {Number(vendor.rating || 0).toFixed(1)}</span>
          <span className="text-gray-200">·</span>
          <span className="text-xs text-gray-500">15–25 min</span>
          <span className="text-gray-200">·</span>
          <span className="text-xs text-gray-500">$2–4 delivery</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">{vendor.address}</p>
      </div>
    </button>
  )
}
