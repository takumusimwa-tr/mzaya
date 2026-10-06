import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ChevronDown, ChevronRight, Clock, Heart, MapPin, Search, ShoppingBag, Star, UserRound, X,
} from 'lucide-react'
import { browseAPI } from '../../api/api'
import useCartStore from '../../store/useCartStore'
import useLocation from '../../hooks/useLocation'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Icon from '../../components/ui/Icon'
import Money from '../../components/ui/Money'
import imageUrl from '../../utils/imageUrl'
import { useFavoriteIds } from '../../hooks/useFavorites'
import errandsIllustration from '../../assets/brand/illustrations/onboarding/mzaya-onboarding-errands-02.svg'
import emptyProducts from '../../assets/brand/illustrations/empty-states/mzaya-empty-products.svg'

// ─── Mzaya design tokens (home) ───────────────────────────────────────────────
// One calm white canvas, one confident green, charcoal text. Colour is reserved
// for actions and state so the eye goes to stores and food, not chrome.
const T = {
  green: '#00A651',      // brand primary — CTAs, badges, active state
  greenDeep: '#0B4A3F',  // headings on tinted surfaces
  greenTint: '#E9F7EF',  // soft fills behind icons
  ink: '#16191A',
  ink2: '#5F6B66',
  ink3: '#8C9692',
  line: '#ECEFED',
  fill: '#F4F6F5',
}

const CATEGORIES = [
  { id: 'food', label: 'Food', icon: 'food' },
  { id: 'grocery', label: 'Grocery', icon: 'grocery' },
  { id: 'materials', label: 'Hardware', icon: 'materials' },
  { id: 'errand', label: 'Errands', icon: 'errand' },
]

const COPY = {
  food: { search: 'Search dishes or restaurants', popular: 'Popular dishes near you', stores: 'All restaurants' },
  grocery: { search: 'Search groceries or stores', popular: 'Popular groceries', stores: 'All stores' },
  materials: { search: 'Search materials or suppliers', popular: 'Popular materials', stores: 'All suppliers' },
}

const RECENTS_KEY = 'mzaya_recent_searches'
const readRecents = () => {
  try { return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]') } catch { return [] }
}
const saveRecent = (term) => {
  try {
    const next = [term, ...readRecents().filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 8)
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
  } catch { /* storage unavailable — recents are a convenience only */ }
}

export default function HomePage() {
  const navigate = useNavigate()
  const totalItems = useCartStore((s) => s.totalItems())
  const cartVendor = useCartStore((s) => s.vendorName)
  const cartTotal = useCartStore((s) => s.totalPrice())
  const { isFavorite, toggle } = useFavoriteIds()
  const { city, cities, loading: locationLoading } = useLocation()

  const [category, setCategory] = useState('food')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [citySheet, setCitySheet] = useState(false)
  const [selectedCity, setSelectedCity] = useState(null)

  // Adopt the detected city once; later manual choices must not be overwritten.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (city && !selectedCity) setSelectedCity(city) }, [city])

  const copy = COPY[category] || COPY.food

  const { data: brands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ['browse-brands', category, selectedCity?.id],
    queryFn: () => browseAPI.brands({ category, city_id: selectedCity?.id, lat: city?.lat, lng: city?.lng })
      .then((r) => r.data.brands || []),
    enabled: !!selectedCity,
  })

  const { data: productData, isLoading: productsLoading } = useQuery({
    queryKey: ['browse-products', category, selectedCity?.id, search],
    queryFn: () => browseAPI.products({ category, city_id: selectedCity?.id, q: search || undefined, lat: city?.lat, lng: city?.lng })
      .then((r) => r.data),
    enabled: !!selectedCity,
  })
  const products = productData?.products || []

  if (locationLoading) return <LoadingScreen message="Preparing Mzaya..." />

  const pickCategory = (id) => {
    if (id === 'errand') return navigate('/errand')
    setCategory(id)
    setSearch('')
  }

  const runSearch = (term) => {
    const q = term.trim()
    setSearchOpen(false)
    setSearch(q)
    if (q) saveRecent(q)
  }

  const openStore = (brand) => navigate(`/vendor/${brand.branch_id}?brand=${brand.id}`)
  const openProduct = (p) => navigate(`/vendor/${p.branch_id}?highlight=${p.item_id}`)

  return (
    <main className="min-h-screen bg-white pb-36" style={{ color: T.ink }}>
      {/* ── Top bar: where am I, who am I, what's in my bag ─────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur" style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}>
        <div className="flex h-14 items-center justify-between px-4">
          <button type="button" onClick={() => setCitySheet(true)}
            className="flex min-h-[44px] items-center gap-1.5 rounded-full pr-2 text-left active:opacity-70"
            aria-label="Change delivery city">
            <MapPin size={18} strokeWidth={2.2} style={{ color: T.green }} />
            <span className="text-[15px] font-bold tracking-[-0.01em]">{selectedCity?.name || 'Choose city'}</span>
            <ChevronDown size={16} strokeWidth={2.4} style={{ color: T.ink2 }} />
          </button>
          <div className="flex items-center gap-1">
            <HeaderIcon label="Account" onClick={() => navigate('/profile')}><UserRound size={22} strokeWidth={1.9} /></HeaderIcon>
            <HeaderIcon label={`Cart, ${totalItems} items`} onClick={() => navigate('/cart')}>
              <ShoppingBag size={22} strokeWidth={1.9} />
              {totalItems > 0 && (
                <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ring-2 ring-white"
                  style={{ background: T.green }}>{totalItems}</span>
              )}
            </HeaderIcon>
          </div>
        </div>

        {/* Search is a doorway, not a field: it opens a dedicated screen. */}
        <div className="px-4 pb-3">
          <button type="button" onClick={() => setSearchOpen(true)}
            className="flex h-11 w-full items-center gap-2.5 rounded-full px-4 text-left active:opacity-80"
            style={{ background: T.fill }}>
            <Search size={18} strokeWidth={2.2} style={{ color: T.ink }} />
            <span className={`flex-1 truncate text-[14px] ${search ? 'font-semibold' : ''}`} style={{ color: search ? T.ink : T.ink3 }}>
              {search || copy.search}
            </span>
            {search && (
              <span role="button" tabIndex={0} aria-label="Clear search"
                onClick={(e) => { e.stopPropagation(); setSearch('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setSearch('') } }}
                className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: '#DDE2DF' }}>
                <X size={13} strokeWidth={2.6} />
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Category strip — Mzaya's own icons ───────────────────────────────── */}
      <nav aria-label="Categories" className="flex gap-1 overflow-x-auto px-3 pb-1 pt-1 no-scrollbar">
        {CATEGORIES.map((c) => {
          const active = c.id === category
          return (
            <button key={c.id} type="button" onClick={() => pickCategory(c.id)}
              className="flex w-[76px] flex-shrink-0 flex-col items-center gap-1.5 py-1 transition-transform active:scale-95"
              aria-pressed={active}>
              <span className="flex h-14 w-14 items-center justify-center rounded-full transition-colors"
                style={{ background: active ? T.green : T.greenTint, color: active ? '#fff' : T.greenDeep }}>
                <Icon name={c.icon} size={26} />
              </span>
              <span className="text-[12px] font-semibold" style={{ color: active ? T.ink : T.ink2 }}>{c.label}</span>
            </button>
          )
        })}
      </nav>

      {search ? (
        <SearchResults term={search} loading={productsLoading} products={products} brands={brands}
          onProduct={openProduct} onStore={openStore} />
      ) : (
        <>
          {/* ── Promo: Mzaya's differentiator, with our illustration ──────── */}
          {/* The illustration is a full scene with its own light background, so it
              gets its own column instead of sitting behind the headline. */}
          <section className="px-4 pt-4">
            <button type="button" onClick={() => navigate('/errand')}
              className="flex w-full items-stretch overflow-hidden rounded-2xl text-left transition-transform active:scale-[0.99]"
              style={{ background: T.greenTint }}>
              <div className="flex flex-1 flex-col justify-center py-4 pl-4 pr-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: '#0A7A3D' }}>Only on Mzaya</p>
                <p className="mt-1 text-[19px] font-extrabold leading-tight" style={{ color: T.greenDeep }}>Skip the queue.</p>
                <p className="mt-1 text-[13px] leading-snug" style={{ color: T.ink2 }}>ZIMRA, banks, document drop-offs — a Mzaya stands in line for you.</p>
                <span className="mt-3 inline-flex h-8 w-fit items-center rounded-full px-3.5 text-[13px] font-bold text-white" style={{ background: T.green }}>
                  Book an errand
                </span>
              </div>
              <img src={errandsIllustration} alt="" aria-hidden="true" draggable="false"
                className="w-[44%] flex-shrink-0 select-none object-cover object-center" />
            </button>
          </section>

          {/* ── Popular items rail ─────────────────────────────────────────── */}
          {(productsLoading || products.length > 0) && (
            <section className="pt-6">
              <SectionHeader title={copy.popular} />
              <div className="flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
                {productsLoading
                  ? [0, 1, 2].map((k) => <div key={k} className="h-[188px] w-[148px] flex-shrink-0 animate-pulse rounded-xl" style={{ background: T.fill }} />)
                  : products.slice(0, 10).map((p) => <ProductCard key={`${p.branch_id}-${p.item_id}`} product={p} category={category} onClick={() => openProduct(p)} />)}
              </div>
            </section>
          )}

          {/* ── Stores ─────────────────────────────────────────────────────── */}
          <section className="pt-6">
            <SectionHeader title={copy.stores} count={brands.length} />
            {brandsLoading ? (
              <div className="px-4">{[0, 1, 2].map((k) => <div key={k} className="my-3 h-16 animate-pulse rounded-xl" style={{ background: T.fill }} />)}</div>
            ) : brands.length === 0 ? (
              <div className="px-8 py-10 text-center">
                <img src={emptyProducts} alt="" aria-hidden="true" className="mx-auto w-44 select-none" draggable="false" />
                <p className="mt-3 font-bold">Nothing here yet</p>
                <p className="mt-1 text-[13px]" style={{ color: T.ink2 }}>We&apos;re signing up stores in {selectedCity?.name || 'your city'}. Check back soon.</p>
              </div>
            ) : (
              <ul className="px-4">
                {brands.map((b) => (
                  <StoreRow key={b.id} brand={b} onClick={() => openStore(b)}
                    favorite={isFavorite(b.id)} onFavorite={() => toggle(b.id)} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {/* ── Floating cart bar ─────────────────────────────────────────────── */}
      {totalItems > 0 && (
        <div className="fixed inset-x-0 z-40 px-4" style={{ bottom: 'calc(76px + env(safe-area-inset-bottom))' }}>
          <button type="button" onClick={() => navigate('/cart')}
            className="mx-auto flex h-14 w-full max-w-md items-center gap-3 rounded-full px-5 text-white shadow-[0_10px_28px_rgba(0,166,81,0.35)] transition-transform active:scale-[0.99]"
            style={{ background: T.green }}>
            <ShoppingBag size={20} strokeWidth={2.2} />
            <span className="flex-1 text-left leading-tight">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-white/80">View cart · {totalItems}</span>
              <span className="block truncate text-[15px] font-bold">{cartVendor || 'Your order'}</span>
            </span>
            <span className="text-[15px] font-bold"><Money usd={cartTotal} /></span>
          </button>
        </div>
      )}

      {searchOpen && (
        <SearchScreen placeholder={copy.search} initial={search} products={products}
          onClose={() => setSearchOpen(false)} onSearch={runSearch} />
      )}
      {citySheet && (
        <CitySheet cities={cities || []} current={selectedCity}
          onClose={() => setCitySheet(false)}
          onPick={(c) => { setSelectedCity(c); setCitySheet(false) }} />
      )}
    </main>
  )
}

// ─── Pieces ───────────────────────────────────────────────────────────────────

function HeaderIcon({ label, onClick, children }) {
  return (
    <button type="button" aria-label={label} onClick={onClick}
      className="relative flex h-11 w-11 items-center justify-center rounded-full active:bg-black/5" style={{ color: T.ink }}>
      {children}
    </button>
  )
}

function SectionHeader({ title, count }) {
  return (
    <div className="mb-3 flex items-baseline justify-between px-4">
      <h2 className="text-[19px] font-extrabold tracking-[-0.02em]">{title}</h2>
      {count > 0 && <span className="text-[13px] font-medium" style={{ color: T.ink3 }}>{count}</span>}
    </div>
  )
}

function Logo({ brand, size = 56 }) {
  return brand.logo_url ? (
    <img src={imageUrl(brand.logo_url, 160)} alt="" className="flex-shrink-0 rounded-full object-cover ring-1 ring-black/5" style={{ width: size, height: size }} />
  ) : (
    <span className="flex flex-shrink-0 items-center justify-center rounded-full text-[20px] font-extrabold"
      style={{ width: size, height: size, background: T.greenTint, color: T.greenDeep }}>
      {brand.name?.trim().charAt(0).toUpperCase()}
    </span>
  )
}

function StoreRow({ brand, onClick, favorite, onFavorite }) {
  const rating = Number(brand.rating) || 0
  return (
    <li className="border-b last:border-b-0" style={{ borderColor: T.line }}>
      <div className="flex items-center gap-3 py-3.5">
        <button type="button" onClick={onClick} className={`flex flex-1 items-center gap-3 text-left active:opacity-70 ${brand.is_open ? '' : 'opacity-55'}`}>
          <Logo brand={brand} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[16px] font-bold tracking-[-0.01em]">{brand.name}</span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[13px]" style={{ color: T.ink2 }}>
              {rating > 0 ? (
                <><Star size={12} fill={T.ink} strokeWidth={0} /><span className="font-semibold" style={{ color: T.ink }}>{rating.toFixed(1)}</span></>
              ) : <span className="font-semibold" style={{ color: T.green }}>New on Mzaya</span>}
              {brand.branch_count > 1 && <><Dot />{brand.branch_count} branches</>}
            </span>
            <span className="mt-1.5 flex gap-1.5">
              {brand.is_open ? <Chip tone="green">Open now</Chip> : <Chip>Closed</Chip>}
            </span>
          </span>
        </button>
        {onFavorite && (
          <button type="button" onClick={onFavorite} aria-label={favorite ? `Remove ${brand.name} from favourites` : `Save ${brand.name}`}
            aria-pressed={favorite} className="flex h-11 w-11 items-center justify-center rounded-full active:bg-black/5">
            <Heart size={20} strokeWidth={2} fill={favorite ? T.green : 'none'} style={{ color: favorite ? T.green : T.ink2 }} />
          </button>
        )}
      </div>
    </li>
  )
}

function ProductCard({ product, category, onClick }) {
  return (
    <button type="button" onClick={onClick} className="w-[148px] flex-shrink-0 text-left transition-transform active:scale-[0.98]">
      <span className="relative block h-[120px] overflow-hidden rounded-xl" style={{ background: T.fill }}>
        {product.image_url ? (
          <img src={imageUrl(product.image_url, 320)} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center" style={{ color: '#B9C2BE' }}>
            <Icon name={category} size={34} />
          </span>
        )}
      </span>
      <span className="mt-2 block line-clamp-2 text-[13px] font-semibold leading-snug">{product.name}</span>
      <span className="mt-0.5 block truncate text-[12px]" style={{ color: T.ink2 }}>{product.brand_name}</span>
      <span className="mt-0.5 block text-[13px] font-bold"><Money usd={product.price_usd} /></span>
    </button>
  )
}

function SearchResults({ term, loading, products, brands, onProduct, onStore }) {
  const q = term.toLowerCase()
  const matchingStores = brands.filter((b) => b.name.toLowerCase().includes(q))
  if (loading) return <div className="px-4 pt-4">{[0, 1, 2, 3].map((k) => <div key={k} className="my-3 h-16 animate-pulse rounded-xl" style={{ background: T.fill }} />)}</div>
  if (!products.length && !matchingStores.length) {
    return (
      <div className="px-8 pt-12 text-center">
        <img src={emptyProducts} alt="" aria-hidden="true" className="mx-auto w-44 select-none" draggable="false" />
        <p className="mt-3 font-bold">No results for “{term}”</p>
        <p className="mt-1 text-[13px]" style={{ color: T.ink2 }}>Try another dish, item or store name.</p>
      </div>
    )
  }
  return (
    <div className="pt-4">
      {matchingStores.length > 0 && (
        <section className="pb-2">
          <SectionHeader title="Stores" />
          <ul className="px-4">{matchingStores.map((b) => <StoreRow key={b.id} brand={b} onClick={() => onStore(b)} />)}</ul>
        </section>
      )}
      {products.length > 0 && (
        <section className="pt-2">
          <SectionHeader title="Items" count={products.length} />
          <ul className="px-4">
            {products.map((p) => (
              <li key={`${p.branch_id}-${p.item_id}`} className="border-b last:border-b-0" style={{ borderColor: T.line }}>
                <button type="button" onClick={() => onProduct(p)} className="flex w-full items-center gap-3 py-3 text-left active:opacity-70">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold">{p.name}</span>
                    <span className="block truncate text-[13px]" style={{ color: T.ink2 }}>
                      {p.brand_name}{p.distance_km != null && <> · {p.distance_km} km</>}
                    </span>
                    <span className="mt-0.5 block text-[14px] font-bold"><Money usd={p.price_usd} /></span>
                  </span>
                  <span className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl" style={{ background: T.fill }}>
                    {p.image_url && <img src={imageUrl(p.image_url, 200)} alt="" className="h-full w-full object-cover" />}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function SearchScreen({ placeholder, initial, products, onClose, onSearch }) {
  const [value, setValue] = useState(initial)
  const [recents, setRecents] = useState(readRecents)
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  const suggestions = useMemo(
    () => [...new Set(products.map((p) => p.name))].slice(0, 6),
    [products],
  )
  const clearRecents = () => {
    try { localStorage.removeItem(RECENTS_KEY) } catch { /* ignore */ }
    setRecents([])
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-white" role="dialog" aria-label="Search">
      <form onSubmit={(e) => { e.preventDefault(); onSearch(value) }}
        className="flex items-center gap-2 px-3 pb-3" style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}>
        <button type="button" onClick={onClose} aria-label="Close search" className="flex h-11 w-11 items-center justify-center rounded-full active:bg-black/5">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <label className="flex h-11 flex-1 items-center gap-2.5 rounded-full px-4" style={{ background: T.fill }}>
          <Search size={18} strokeWidth={2.2} />
          <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder}
            enterKeyHint="search" className="h-full flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#8C9692]" />
          {value && (
            <button type="button" onClick={() => setValue('')} aria-label="Clear" className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: '#DDE2DF' }}>
              <X size={13} strokeWidth={2.6} />
            </button>
          )}
        </label>
      </form>

      <div className="flex-1 overflow-y-auto pb-10">
        {recents.length > 0 && (
          <section className="pt-2">
            <div className="flex items-baseline justify-between px-4 pb-1">
              <h2 className="text-[17px] font-extrabold">Recent searches</h2>
              <button type="button" onClick={clearRecents} className="text-[13px] font-semibold" style={{ color: T.green }}>Clear</button>
            </div>
            <ul>
              {recents.map((r) => (
                <li key={r}>
                  <button type="button" onClick={() => onSearch(r)} className="flex h-12 w-full items-center gap-4 px-4 text-left active:bg-black/5">
                    <Clock size={19} strokeWidth={2} style={{ color: T.ink2 }} />
                    <span className="text-[15px]">{r}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        {suggestions.length > 0 && (
          <section className="pt-4">
            <h2 className="px-4 pb-1 text-[17px] font-extrabold">Popular right now</h2>
            <ul>
              {suggestions.map((s) => (
                <li key={s}>
                  <button type="button" onClick={() => onSearch(s)} className="flex h-12 w-full items-center gap-4 px-4 text-left active:bg-black/5">
                    <Search size={18} strokeWidth={2} style={{ color: T.ink2 }} />
                    <span className="flex-1 truncate text-[15px]">{s}</span>
                    <ChevronRight size={16} style={{ color: T.ink3 }} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}

function CitySheet({ cities, current, onClose, onPick }) {
  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-label="Choose your city">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-x-0 bottom-0 rounded-t-[20px] bg-white px-4 pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
        style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}>
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-black/15" />
        <h2 className="pb-2 text-[19px] font-extrabold">Deliver to</h2>
        <ul>
          {cities.map((c) => {
            const active = c.slug === current?.slug
            return (
              <li key={c.slug}>
                <button type="button" onClick={() => onPick(c)} className="flex h-14 w-full items-center gap-3 text-left active:opacity-70">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: active ? T.green : T.greenTint, color: active ? '#fff' : T.greenDeep }}>
                    <MapPin size={18} strokeWidth={2.2} />
                  </span>
                  <span className="flex-1 text-[16px] font-semibold">{c.name}</span>
                  {active && <span className="text-[13px] font-bold" style={{ color: T.green }}>Current</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function Chip({ children, tone }) {
  return (
    <span className="inline-flex h-[22px] items-center rounded-md px-2 text-[11px] font-semibold"
      style={tone === 'green' ? { background: T.greenTint, color: '#0A7A3D' } : { background: T.fill, color: T.ink2 }}>
      {children}
    </span>
  )
}

const Dot = () => <span aria-hidden="true" style={{ color: T.ink3 }}>·</span>
