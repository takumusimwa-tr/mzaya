import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { vendorAPI, cityAPI } from '../../api/api'
import useAuthStore from '../../store/useAuthStore'
import useCartStore from '../../store/useCartStore'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Badge from '../../components/ui/Badge'

const CATEGORIES = [
  { id: 'food',      label: 'Food',      emoji: '🍽️', hasVendors: true  },
  { id: 'grocery',   label: 'Grocery',   emoji: '🛒', hasVendors: true  },
  { id: 'materials', label: 'Materials', emoji: '🏗️', hasVendors: true  },
  { id: 'errand',    label: 'Errands',   emoji: '📋', hasVendors: false },
]

export default function HomePage() {
  const user       = useAuthStore((s) => s.user)
  const totalItems = useCartStore((s) => s.totalItems())
  const navigate   = useNavigate()
  const [category, setCategory] = useState('food')
  const [cityId,   setCityId]   = useState(null)

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn:  () => cityAPI.list().then((r) => r.data.cities),
  })

  const currentCat = CATEGORIES.find((c) => c.id === category)

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors', category, cityId],
    queryFn:  () => vendorAPI.list({ category, city_id: cityId }).then((r) => r.data.vendors),
    enabled:  currentCat?.hasVendors,
  })

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-green-600 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-green-100 text-xs">Good day,</p>
            <h1 className="text-white font-bold text-lg">{user?.name?.split(' ')[0]}</h1>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="relative bg-white/20 p-2.5 rounded-xl"
          >
            <CartIcon />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* City selector */}
        {cities?.length > 0 && (
          <select
            value={cityId || ''}
            onChange={(e) => setCityId(e.target.value || null)}
            className="w-full bg-white/20 text-white text-sm px-3 py-2 rounded-xl outline-none"
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id} className="text-gray-800">{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Categories */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id)
                if (!cat.hasVendors) navigate('/errand')
              }}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${category === cat.id
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200'
                }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Vendors */}
      <div className="px-4 mt-5">
        {currentCat?.hasVendors ? (
          <>
            <h2 className="text-base font-bold text-gray-900 mb-3">
              {currentCat.label} near you
            </h2>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 rounded-full border-4 border-green-100 border-t-green-600 animate-spin" />
              </div>
            ) : !vendors?.length ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🏪</p>
                <p className="text-gray-500 text-sm">No vendors available right now</p>
                <p className="text-gray-400 text-xs mt-1">Check back later or try another category</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {vendors.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    onClick={() => navigate(`/vendor/${vendor.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}

function VendorCard({ vendor, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden active:scale-98 transition-transform"
    >
      <div className="h-36 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
        <span className="text-5xl">🏪</span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-gray-900">{vendor.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{vendor.address}</p>
          </div>
          <Badge label={vendor.category} type={vendor.category} />
        </div>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            ⭐ {Number(vendor.rating || 0).toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">•</span>
          <span className={`text-xs font-medium ${vendor.is_open ? 'text-green-600' : 'text-red-500'}`}>
            {vendor.is_open ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>
    </button>
  )
}

function CartIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}
