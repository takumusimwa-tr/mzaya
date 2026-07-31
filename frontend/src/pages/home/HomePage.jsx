import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Hammer,
  PackageCheck,
  ShoppingBag,
  ShoppingBasket,
  UserRound,
  Utensils,
} from 'lucide-react'
import { browseAPI } from '../../api/api'
import useAuthStore from '../../store/useAuthStore'
import useCartStore from '../../store/useCartStore'
import useLocation from '../../hooks/useLocation'
import LoadingScreen from '../../components/ui/LoadingScreen'
import { useFavoriteIds } from '../../hooks/useFavorites'
import { MzayaWordmark } from '../../components/brand/MzayaLockup'
import SearchBar from '../../components/ui/SearchBar'
import ServiceCard from '../../components/home/ServiceCard'
import MerchantCard from '../../components/home/MerchantCard'
import { ProductRow, ProductTile } from '../../components/home/ProductCard'
import { HomeEmptyState, HomeSectionHeading, HomeSkeletonList } from '../../components/home/HomeFeedback'

const BRAND = {
  green: '#136B57',
  greenDark: '#0B4A3F',
  canvas: '#F6F8F6',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF3F0',
  text: '#121714',
  textSecondary: '#526159',
  textMuted: '#7C8982',
  border: '#E2E8E4',
}

const SERVICES = [
  { id: 'food', label: 'Food', description: 'Restaurants & meals', Icon: Utensils },
  { id: 'grocery', label: 'Groceries', description: 'Daily essentials', Icon: ShoppingBasket },
  { id: 'materials', label: 'Hardware', description: 'Building supplies', Icon: Hammer },
  { id: 'errand', label: 'Courier', description: 'Send a package', Icon: PackageCheck },
]

const PRODUCT_FIRST = ['food', 'grocery', 'materials']

const NOUNS = {
  food: {
    search: 'Search dishes or restaurants',
    popular: 'Popular dishes',
    stores: 'Restaurants near you',
  },
  grocery: {
    search: 'Search groceries or stores',
    popular: 'Popular items',
    stores: 'Stores near you',
  },
  materials: {
    search: 'Search materials or suppliers',
    popular: 'Popular materials',
    stores: 'Suppliers near you',
  },
}

const DEFAULT_NOUN = {
  search: 'Search products or services',
  popular: 'Popular near you',
  stores: 'Merchants near you',
}

const nounFor = (category) => NOUNS[category] || DEFAULT_NOUN

export default function HomePage() {
  const user = useAuthStore((state) => state.user)
  const totalItems = useCartStore((state) => state.totalItems())
  const navigate = useNavigate()
  const [category, setCategory] = useState('food')
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState(null)

  const { isFavorite, toggle } = useFavoriteIds()
  const { city, loading: locationLoading } = useLocation()
  const [selectedCity, setSelectedCity] = useState(null)

  // Keep location contextual: it powers availability without becoming decorative UI.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { if (city && !selectedCity) setSelectedCity(city) }, [city])

  const isProductFirst = PRODUCT_FIRST.includes(category)
  const noun = nounFor(category)

  const { data: brands, isLoading: brandsLoading } = useQuery({
    queryKey: ['browse-brands', category, selectedCity?.id],
    queryFn: () => browseAPI.brands({
      category,
      city_id: selectedCity?.id,
      lat: city?.lat,
      lng: city?.lng,
    }).then((response) => response.data.brands),
    enabled: category !== 'errand' && !!selectedCity,
  })

  const { data: productData, isLoading: productsLoading } = useQuery({
    queryKey: ['browse-products', category, selectedCity?.id, activeCat, search],
    queryFn: () => browseAPI.products({
      category,
      city_id: selectedCity?.id,
      q: search || undefined,
      lat: city?.lat,
      lng: city?.lng,
    }).then((response) => response.data),
    enabled: isProductFirst && !!selectedCity,
  })

  if (locationLoading) return <LoadingScreen message="Preparing Mzaya..." />

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.trim().split(' ')[0] || 'there'

  const filteredBrands = (brands || []).filter((brand) =>
    !search || brand.name.toLowerCase().includes(search.toLowerCase())
  )

  const products = (productData?.products || []).filter((product) =>
    !activeCat || product.category === activeCat
  )

  const productCategories = productData?.categories || []

  const selectService = (serviceId) => {
    if (serviceId === 'errand') {
      navigate('/errand')
      return
    }

    setCategory(serviceId)
    setSearch('')
    setActiveCat(null)
  }

  return (
    <main className="min-h-screen pb-28" style={{ background: BRAND.canvas, color: BRAND.text }}>
      <header
        className="sticky top-0 z-40 px-5 pt-11 pb-4"
        style={{
          background: 'rgba(255,255,255,0.96)',
          borderBottom: `1px solid ${BRAND.border}`,
          backdropFilter: 'blur(18px)',
        }}
      >
        <div className="flex items-center justify-between">
          <MzayaWordmark size="text-2xl" />

          <div className="flex items-center gap-2">
            <IconButton label="Open account" onClick={() => navigate('/profile')}>
              <UserRound size={18} strokeWidth={1.8} />
            </IconButton>
            <IconButton label="Open cart" onClick={() => navigate('/cart')} className="relative">
              <ShoppingBag size={18} strokeWidth={1.8} />
              {totalItems > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                  style={{ background: BRAND.green }}
                >
                  {Math.min(totalItems, 99)}
                </span>
              )}
            </IconButton>
          </div>
        </div>
      </header>

      <section className="bg-white px-5 pb-6 pt-7">
        <p className="text-[15px] font-medium" style={{ color: BRAND.textSecondary }}>
          {greeting}, {firstName}
        </p>
        <h1 className="mt-1 text-[30px] font-semibold leading-[1.16] tracking-[-0.035em]" style={{ color: BRAND.text }}>
          What do you need today?
        </h1>

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={noun.search}
          ariaLabel={noun.search}
          className="mt-6"
        />
      </section>

      <section className="border-t px-5 py-6" style={{ background: BRAND.surface, borderColor: BRAND.border }}>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Services</h2>
            <p className="mt-1 text-[13px]" style={{ color: BRAND.textMuted }}>
              One place for everyday needs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.id}
              label={service.label}
              description={service.description}
              icon={service.Icon}
              active={category === service.id}
              onClick={() => selectService(service.id)}
            />
          ))}
        </div>
      </section>

      {isProductFirst && productCategories.length > 0 && !search && (
        <section className="px-5 pt-5">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <CategoryChip label="All" active={!activeCat} onClick={() => setActiveCat(null)} />
            {productCategories.map((item) => (
              <CategoryChip key={item} label={item} active={activeCat === item} onClick={() => setActiveCat(item)} />
            ))}
          </div>
        </section>
      )}

      <section className="px-5 pt-6">
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
      </section>
    </main>
  )
}

function IconButton({ label, onClick, className = '', children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all active:scale-95 ${className}`}
      style={{ background: BRAND.surface, borderColor: BRAND.border, color: BRAND.text }}
    >
      {children}
    </button>
  )
}



function BrandFirst({ brands, loading, search, category, navigate, isFavorite, toggle }) {
  const service = SERVICES.find((item) => item.id === category)
  const title = search ? `Results for “${search}”` : `${service?.label || 'Merchants'} near you`

  return (
    <>
      <HomeSectionHeading title={title} count={brands.length} />
      {loading ? (
        <HomeSkeletonList />
      ) : brands.length === 0 ? (
        <HomeEmptyState search={search} />
      ) : (
        <div className="flex flex-col gap-4">
          {brands.map((brand) => (
            <MerchantCard
              key={brand.id}
              merchant={brand}
              onClick={() => navigate(`/vendor/${brand.branch_id}?brand=${brand.id}`)}
              isFavorite={isFavorite(brand.id)}
              onToggleFavorite={() => toggle(brand.id)}
            />
          ))}
        </div>
      )}
    </>
  )
}

function ProductFirst({ products, brands, loading, storesLoading, search, activeCat, category, navigate, isFavorite, toggle }) {
  const noun = nounFor(category)

  if (search) {
    return (
      <>
        <HomeSectionHeading title={`Results for “${search}”`} count={products.length} countLabel="item" />
        {loading ? (
          <HomeSkeletonList />
        ) : products.length === 0 ? (
          <HomeEmptyState search={search} productMode />
        ) : (
          <div className="flex flex-col gap-3">
            {products.map((product) => (
              <ProductRow
                key={`${product.branch_id}-${product.item_id}`}
                product={product}
                onClick={() => navigate(`/vendor/${product.branch_id}?highlight=${product.item_id}`)}
              />
            ))}
          </div>
        )}
      </>
    )
  }

  const popular = products.slice(0, 12)

  return (
    <>
      {!loading && popular.length > 0 && (
        <div className="mb-8">
          <HomeSectionHeading title={activeCat ? `Popular in ${activeCat}` : noun.popular} />
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 no-scrollbar">
            {popular.map((product) => (
              <ProductTile
                key={`${product.branch_id}-${product.item_id}`}
                product={product}
                onClick={() => navigate(`/vendor/${product.branch_id}?highlight=${product.item_id}`)}
              />
            ))}
          </div>
        </div>
      )}

      <HomeSectionHeading title={noun.stores} count={brands?.length || 0} countLabel="store" />
      {storesLoading ? (
        <HomeSkeletonList />
      ) : !brands?.length ? (
        <HomeEmptyState productMode />
      ) : (
        <div className="flex flex-col gap-4">
          {brands.map((brand) => (
            <MerchantCard
              key={brand.id}
              merchant={brand}
              onClick={() => navigate(`/vendor/${brand.branch_id}?brand=${brand.id}`)}
              isFavorite={isFavorite(brand.id)}
              onToggleFavorite={() => toggle(brand.id)}
            />
          ))}
        </div>
      )}
    </>
  )
}

function CategoryChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-shrink-0 rounded-full border px-4 py-2.5 text-[12px] font-semibold transition-all active:scale-95"
      style={active
        ? { background: BRAND.greenDark, borderColor: BRAND.greenDark, color: '#FFFFFF' }
        : { background: BRAND.surface, borderColor: BRAND.border, color: BRAND.textSecondary }
      }
    >
      {label}
    </button>
  )
}
