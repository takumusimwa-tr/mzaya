import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { browseAPI } from '../../api/api'
import useAuthStore from '../../store/useAuthStore'
import useCartStore from '../../store/useCartStore'
import useLocation from '../../hooks/useLocation'
import LoadingScreen from '../../components/ui/LoadingScreen'
import imageUrl from '../../utils/imageUrl'
import { useFavoriteIds } from '../../hooks/useFavorites'
import { MzayaWordmark } from '../../components/brand/MzayaLockup'

const CATEGORIES = [
  { id: 'food',      label: 'Food',      emoji: '🍽️' },
  { id: 'grocery',   label: 'Grocery',   emoji: '🛒' },
  { id: 'materials', label: 'Materials', emoji: '🏗️' },
  { id: 'errand',    label: 'Errands',   emoji: '📋' },
]

// Product-first verticals browse by product; the rest browse by brand/store.
const PRODUCT_FIRST = ['materials', 'grocery']

export default function HomePage() {
  const user       = useAuthStore((s) => s.user)
  const totalItems = useCartStore((s) => s.totalItems())
  const navigate   = useNavigate()
  const [category, setCategory] = useState('food')
  const [search,   setSearch]   = useState('')
  const [focused,  setFocused]  = useState(false)
  const [activeCat, setActiveCat] = useState(null) // selected product category chip

  const { isFavorite, toggle } = useFavoriteIds()
  const { city, loading: locLoading } = useLocation()
  const [selectedCity, setSelectedCity] = useState(null)
  useEffect(() => { if (city && !selectedCity) setSelectedCity(city) }, [city])

  const isProductFirst = PRODUCT_FIRST.includes(category)

  // Brand-first (food): list brands resolved to nearest branch.
  // Also used for the STORE LIST below the product carousel in product-first mode.
  const { data: brands, isLoading: brandsLoading } = useQuery({
    queryKey: ['browse-brands', category, selectedCity?.id],
    queryFn:  () => browseAPI.brands({
      category, city_id: selectedCity?.id,
      lat: city?.lat, lng: city?.lng,
    }).then((r) => r.data.brands),
    enabled: category !== 'errand' && !!selectedCity,
  })

  // Product-first (materials/grocery): list products across stores.
  const { data: productData, isLoading: productsLoading } = useQuery({
    queryKey: ['browse-products', category, selectedCity?.id, activeCat, search],
    queryFn:  () => browseAPI.products({
      category, city_id: selectedCity?.id, q: search || undefined,
      lat: city?.lat, lng: city?.lng,
    }).then((r) => r.data),
    enabled: isProductFirst && !!selectedCity,
  })

  if (locLoading) return <LoadingScreen message="Finding what's near you..." />

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Filtered brand list (client search on brand names).
  const filteredBrands = (brands || []).filter((b) =>
    !search || b.name.toLowerCase().includes(search.toLowerCase())
  )

  // Product list, optionally filtered by the selected category chip.
  const products = (productData?.products || []).filter((p) =>
    !activeCat || p.category === activeCat
  )
  const productCategories = productData?.categories || []

  return (
    <div className="min-h-screen pb-28" style={{ background: '#F8F8F8' }}>

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-white px-4 pt-12 pb-3" style={{ boxShadow: '0 1px 0 #F0F0F0' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <MzayaWordmark size="text-2xl" />
            {selectedCity && <span className="text-xs text-gray-400 font-medium ml-1 mt-0.5">· {selectedCity.name}</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </button>
            <button onClick={() => navigate('/cart')}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center relative active:bg-gray-200">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                  style={{ background: '#00A651', fontSize: 9 }}>{totalItems}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Greeting + Search ── */}
      <div className="px-4 pt-4 pb-4 bg-white border-b border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 mb-3">{greeting}, {user?.name?.split(' ')[0]}! 👋</h2>
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${focused ? 'ring-2 ring-red-400' : ''}`}
          style={{ background: '#F2F2F2' }}>
          <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder={isProductFirst ? 'Search products...' : 'Search restaurants, stores...'}
            className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400" />
          {search && <button onClick={() => setSearch('')} className="text-gray-400 text-xl leading-none">×</button>}
        </div>
      </div>

      {/* ── Category tabs ── */}
      <div className="bg-white px-4 pt-4 pb-4 border-b border-gray-100">
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button key={cat.id}
              onClick={() => {
                setCategory(cat.id); setSearch(''); setActiveCat(null)
                if (cat.id === 'errand') navigate('/errand')
              }}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 active:opacity-70">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all"
                style={{
                  background: category === cat.id ? '#00A651' : '#F5F5F5',
                  boxShadow: category === cat.id ? '0 4px 12px #00A65140' : 'none',
                  transform: category === cat.id ? 'scale(1.05)' : 'scale(1)',
                }}>
                {cat.emoji}
              </div>
              <span className="text-xs font-semibold" style={{ color: category === cat.id ? '#00A651' : '#888' }}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Product-category chips (product-first only) ── */}
      {isProductFirst && productCategories.length > 0 && !search && (
        <div className="px-4 pt-4 pb-1">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <CategoryChip label="All" active={!activeCat} onClick={() => setActiveCat(null)} />
            {productCategories.map((c) => (
              <CategoryChip key={c} label={c} active={activeCat === c} onClick={() => setActiveCat(c)} />
            ))}
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="px-4 mt-4">
        {isProductFirst ? (
          <ProductFirst
            products={products}
            brands={filteredBrands}
            loading={productsLoading}
            storesLoading={brandsLoading}
            search={search}
            activeCat={activeCat}
            category={category}
            navigate={navigate}
            isFavorite={isFavorite}
            toggle={toggle}
          />
        ) : (
          <BrandFirst
            brands={filteredBrands}
            loading={brandsLoading}
            search={search}
            category={category}
            navigate={navigate}
            isFavorite={isFavorite}
            toggle={toggle}
          />
        )}
      </div>
    </div>
  )
}

// ─── Brand-first (food) ───────────────────────────────────────────────────────
function BrandFirst({ brands, loading, search, category, navigate, isFavorite, toggle }) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-black text-gray-900">
          {search ? `"${search}"` : `${CATEGORIES.find(c => c.id === category)?.label} near you`}
        </h3>
        {brands.length > 0 && <span className="text-xs text-gray-400">{brands.length} place{brands.length !== 1 ? 's' : ''}</span>}
      </div>

      {loading ? (
        <SkeletonList />
      ) : brands.length === 0 ? (
        <EmptyState search={search} />
      ) : (
        <div className="flex flex-col gap-4">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand}
              onClick={() => navigate(`/vendor/${brand.branch_id}?brand=${brand.id}`)}
              isFavorite={isFavorite(brand.id)}
              onToggleFavorite={() => toggle(brand.id)} />
          ))}
        </div>
      )}
    </>
  )
}

function BrandCard({ brand, onClick, isFavorite, onToggleFavorite }) {
  return (
    <button onClick={onClick}
      className="w-full text-left bg-white rounded-2xl overflow-hidden active:scale-98 transition-transform"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
      <div className="relative h-44 overflow-hidden bg-gray-100">
        {brand.cover_url
          ? <img src={imageUrl(brand.cover_url)} alt={brand.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8)' }}><span className="text-6xl opacity-20">🏪</span></div>
        }
        {!brand.is_open && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-black text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200">Closed</span>
          </div>
        )}
        <button onClick={(e) => { e.stopPropagation(); onToggleFavorite?.() }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <svg className="w-4 h-4" fill={isFavorite ? '#00A651' : 'none'} stroke={isFavorite ? '#00A651' : '#6b7280'} strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <div className="absolute bottom-3 left-3 w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center border border-gray-100">
          {brand.logo_url
            ? <img src={imageUrl(brand.logo_url)} alt="" className="w-full h-full object-cover rounded-xl" />
            : <span className="text-lg font-black text-gray-500">{brand.name?.charAt(0)}</span>
          }
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-start justify-between">
          <h3 className="font-black text-gray-900 text-base">{brand.name}</h3>
          {brand.is_open && <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Open</span>}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-semibold text-gray-600">⭐ {Number(brand.rating || 0).toFixed(1)}</span>
          <span className="text-gray-200">·</span>
          <span className="text-xs text-gray-500">15–25 min</span>
          <span className="text-gray-200">·</span>
          <span className="text-xs text-gray-500">$2–4 delivery</span>
        </div>
        {/* Brand — no branch address shown to the customer */}
        {brand.branch_count > 1 && (
          <p className="text-xs text-gray-400 mt-1">{brand.branch_count} branches near you</p>
        )}
      </div>
    </button>
  )
}

// ─── Product-first (materials/grocery): Popular carousel + store list ─────────
function ProductFirst({ products, brands, loading, storesLoading, search, activeCat, category, navigate, isFavorite, toggle }) {
  // When searching, product results take over (flat list — search is product-intent).
  if (search) {
    return (
      <>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-black text-gray-900">"{search}"</h3>
          {products.length > 0 && <span className="text-xs text-gray-400">{products.length} item{products.length !== 1 ? 's' : ''}</span>}
        </div>
        {loading ? <SkeletonList /> : products.length === 0 ? <EmptyState search={search} productMode /> : (
          <div className="flex flex-col gap-3">
            {products.map((p) => (
              <ProductRow key={`${p.branch_id}-${p.item_id}`} product={p}
                onClick={() => navigate(`/vendor/${p.branch_id}?highlight=${p.item_id}`)} />
            ))}
          </div>
        )}
      </>
    )
  }

  // Default: a Popular product teaser carousel, then the store list as the anchor.
  const popular = products.slice(0, 12)

  return (
    <>
      {/* Popular products — horizontal teaser */}
      {!loading && popular.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-black text-gray-900 mb-3">
            {activeCat ? `Popular in ${activeCat}` : 'Popular near you'}
          </h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
            {popular.map((p) => (
              <ProductTile key={`${p.branch_id}-${p.item_id}`} product={p}
                onClick={() => navigate(`/vendor/${p.branch_id}?highlight=${p.item_id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* Stores — the main list */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-black text-gray-900">Stores near you</h3>
        {brands?.length > 0 && <span className="text-xs text-gray-400">{brands.length} store{brands.length !== 1 ? 's' : ''}</span>}
      </div>
      {storesLoading ? <SkeletonList /> : !brands?.length ? <EmptyState productMode /> : (
        <div className="flex flex-col gap-4">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand}
              onClick={() => navigate(`/vendor/${brand.branch_id}?brand=${brand.id}`)}
              isFavorite={isFavorite(brand.id)}
              onToggleFavorite={() => toggle(brand.id)} />
          ))}
        </div>
      )}
    </>
  )
}

// Compact product tile for the horizontal carousel.
function ProductTile({ product, onClick }) {
  return (
    <button onClick={onClick}
      className="flex-shrink-0 w-36 text-left bg-white rounded-2xl overflow-hidden active:scale-98 transition-transform"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
      <div className="h-28 bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.image_url
          ? <img src={imageUrl(product.image_url)} alt={product.name} className="w-full h-full object-cover" />
          : <span className="text-3xl opacity-30">📦</span>
        }
      </div>
      <div className="p-2.5">
        <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
        <p className="text-xs text-gray-400 truncate">{product.brand_name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="font-black text-gray-900 text-sm">${Number(product.price_usd).toFixed(2)}</span>
          {product.distance_km != null && <span className="text-[10px] text-gray-400">{product.distance_km}km</span>}
        </div>
      </div>
    </button>
  )
}

// Full-width product row (used in search results).
function ProductRow({ product, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full text-left bg-white rounded-2xl p-3 flex items-center gap-3 active:scale-98 transition-transform"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
      <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
        {product.image_url
          ? <img src={imageUrl(product.image_url)} alt={product.name} className="w-full h-full object-cover" />
          : <span className="text-2xl opacity-30">📦</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 truncate">{product.name}</p>
        {product.description && <p className="text-xs text-gray-400 truncate">{product.description}</p>}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-semibold text-gray-600">{product.brand_name}</span>
          {product.distance_km != null && (
            <><span className="text-gray-200">·</span><span className="text-xs text-gray-400">{product.distance_km} km</span></>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-black text-gray-900">${Number(product.price_usd).toFixed(2)}</p>
      </div>
    </button>
  )
}

// ─── shared ───────────────────────────────────────────────────────────────────
function CategoryChip({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className="flex-shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition-all"
      style={active
        ? { background: '#00A651', color: '#fff' }
        : { background: '#fff', color: '#555', border: '1px solid #E5E5E5', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }
      }>
      {label}
    </button>
  )
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <div className="h-44 bg-gray-200" />
          <div className="p-4"><div className="h-4 bg-gray-200 rounded w-2/3 mb-2" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ search, productMode }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
      <div className="text-5xl mb-3">{productMode ? '📦' : '🏪'}</div>
      <p className="font-bold text-gray-800 mb-1">
        {search ? 'No results found' : productMode ? 'No products here yet' : 'No vendors here yet'}
      </p>
      <p className="text-gray-400 text-sm">{search ? 'Try a different search' : 'New stock coming soon'}</p>
    </div>
  )
}
