import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'
import useActiveBranch from '../../store/useActiveBranch'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Badge from '../../components/ui/Badge'
import { sendNotification } from '../../hooks/useNotifications'
import imageUrl from '../../utils/imageUrl'
import Icon from '../../components/ui/Icon'

// Generate a consistent accent color from vendor name
function vendorColor(name = '') {
  // Each vendor gets a slightly different accent so branches feel distinct —
  // but all of them live in the Mzaya green family. The old palette was a
  // rainbow (red / blue / purple / amber) that fought the brand everywhere it
  // appeared.
  const colors = [
    { bg: '#00A651', light: '#EDFAF3', text: '#00A651' }, // brand green
    { bg: '#00873F', light: '#E7F6EE', text: '#00873F' }, // deep green
    { bg: '#0F9D58', light: '#EAF7F0', text: '#0F9D58' }, // leaf
    { bg: '#12B76A', light: '#E8FAF1', text: '#0B8A50' }, // emerald
    { bg: '#047857', light: '#E6F4F0', text: '#047857' }, // pine
    { bg: '#15803D', light: '#E9F6EC', text: '#15803D' }, // forest
  ]
  const idx = (name.charCodeAt(0) || 0) % colors.length
  return colors[idx]
}

export default function VendorHome() {
  const branchId    = useActiveBranch((s) => s.branchId)
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const prevCount   = useRef(0)

  const { data: vendorData, isLoading } = useQuery({
    queryKey: ['my-vendor', branchId],
    queryFn:  () => api.get('/vendors/my', { params: branchId ? { branch_id: branchId } : {} }).then((r) => r.data.vendor),
  })

  const { data: orders } = useQuery({
    queryKey: ['vendor-orders', branchId],
    queryFn:  () => api.get('/orders/vendor', { params: branchId ? { branch_id: branchId } : {} }).then((r) => r.data.orders),
    refetchInterval: 15000,
    onSuccess: (data) => {
      const pending = data?.filter((o) => o.status === 'pending') || []
      if (pending.length > prevCount.current) {
        sendNotification('🔔 New order!', `${pending.length} new order${pending.length > 1 ? 's' : ''} waiting`, () => navigate('/vendor/orders'))
      }
      prevCount.current = pending.length
    },
  })

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission()
  }, [])

  const togglePause = useMutation({
    mutationFn: () => api.put(`/vendors/${vendorData?.id}`, { is_paused: !vendorData?.is_paused }),
    onSuccess:  () => queryClient.invalidateQueries(['my-vendor']),
  })

  const DEFAULT_COLOR = { bg: '#00873F', light: '#E7F6EE', text: '#00873F' }
  const color = vendorData ? vendorColor(vendorData.name || '') : DEFAULT_COLOR

  if (isLoading || !vendorData) return <LoadingScreen message="Loading..." />

  const pending   = orders?.filter((o) => o.status === 'pending')   || []
  const active    = orders?.filter((o) => ['accepted', 'picked_up', 'en_route'].includes(o.status)) || []
  const delivered = orders?.filter((o) => o.status === 'delivered') || []
  const revenue   = delivered.reduce((sum, o) => sum + Number(o.subtotal_usd || 0), 0)
  const menuItems = vendorData?.menuItems || []

  return (
    <div className="h-screen overflow-y-auto" style={{ background: '#F7F7F7' }}>
     <div className="w-full px-6">

      {/* ── Hero header ── */}
      <div className="px-4 pt-12 pb-5 bg-white border-b border-gray-100">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ background: color.light, border: `1.5px solid ${color.bg}22` }}>
            {vendorData?.logo_url
              ? <img src={imageUrl(vendorData.logo_url, 150)} alt="" className="w-full h-full object-cover rounded-2xl" />
              : <span className="text-2xl font-black" style={{ color: color.bg }}>
                  {vendorData?.name?.charAt(0)}
                </span>
            }
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-black text-gray-900 text-xl leading-tight truncate">
              {vendorData?.name}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{vendorData?.address}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-yellow-500 font-semibold">
                ★ {Number(vendorData?.rating || 0).toFixed(1)}
              </span>
              <span className="text-gray-200">·</span>
              <span className="text-xs text-gray-400 capitalize">{vendorData?.category}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Live open/closed status (auto from hours) */}
            <span className="px-3 py-1.5 rounded-full text-xs font-bold border"
              style={vendorData?.is_open
                ? { background: '#EDFAF3', color: '#00A651', borderColor: '#00A65130' }
                : { background: '#FDECEC', color: '#D33', borderColor: '#D3333330' }
              }>
              {vendorData?.is_open ? '● Open' : '○ Closed'}
            </span>
            {/* Manual pause override */}
            <button onClick={() => togglePause.mutate()} disabled={togglePause.isPending}
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 border disabled:opacity-50"
              style={vendorData?.is_paused
                ? { background: '#EDFAF3', color: '#00A651', borderColor: '#00A65130' }
                : { background: '#F5F5F5', color: '#888', borderColor: '#E5E5E5' }
              }>
              {vendorData?.is_paused ? '▶ Resume orders' : '⏸ Pause orders'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-0 mt-5 bg-gray-50 rounded-2xl overflow-hidden">
          {[
            { label: 'New',      value: pending.length,   color: pending.length > 0 ? '#00A651' : '#111' },
            { label: 'Active',   value: active.length,    color: '#0F9D58'                               },
            { label: 'Done',     value: delivered.length, color: '#111'                                  },
            { label: 'Revenue',  value: `$${revenue.toFixed(0)}`, color: '#00A651'                      },
          ].map((stat, i) => (
            <div key={stat.label} className={`py-4 text-center ${i < 3 ? 'border-r border-gray-200' : ''}`}>
              <p className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-4">
        {/* New orders alert */}
        {pending.length > 0 && (
          <button onClick={() => navigate('/vendor/orders')}
            className="w-full rounded-2xl p-4 flex items-center justify-between active:scale-98"
            style={{ background: '#00A651', boxShadow: '0 4px 20px #00A65130' }}>
            <div className="flex items-center gap-3">
              <span className="animate-bounce"><Icon name="notify" size={22} /></span>
              <div className="text-left">
                <p className="font-black text-white text-base">
                  {pending.length} new order{pending.length > 1 ? 's' : ''}
                </p>
                <p className="text-red-100 text-xs mt-0.5">Tap to view and prepare</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Orders', sub: `${pending.length + active.length} active`, icon: 'orders', path: '/vendor/orders', accent: color },
            { label: 'Menu',   sub: `${menuItems.length} items`,                icon: 'menu', path: '/vendor/menu',   accent: color },
          ].map((item) => (
            <button key={item.label} onClick={() => navigate(item.path)}
              className="bg-white rounded-2xl p-4 text-left active:scale-98 border border-gray-100"
              style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: item.accent.light }}>
                <span className="flex items-center justify-center"><Icon name={item.icon} size={22} /></span>
              </div>
              <p className="font-bold text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
            </button>
          ))}
        </div>

        {/* Menu preview */}
        {menuItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-gray-900">Menu</p>
              <button onClick={() => navigate('/vendor/menu')}
                className="text-xs font-semibold" style={{ color: color.bg }}>
                Edit →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {menuItems.slice(0, 4).map((item) => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100"
                  style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                  <div className="h-24 flex items-center justify-center overflow-hidden"
                    style={{ background: color.light }}>
                    {item.image_url
                      ? <img src={imageUrl(item.image_url, 300)} alt={item.name} className="w-full h-full object-cover" />
                      : <Icon name="food" size={28} className="opacity-40" />
                    }
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                    <p className="text-sm font-black mt-0.5" style={{ color: color.bg }}>
                      US${Number(item.price_usd).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent orders */}
        {orders?.length > 0 && (
          <div>
            <p className="font-bold text-gray-900 mb-3">Recent orders</p>
            {orders.slice(0, 5).map((order) => (
              <div key={order.id}
                className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between mb-3"
                style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                <div>
                  <p className="text-xs font-mono text-gray-300">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate max-w-[160px]">
                    {order.dropoff_address}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <Badge label={order.status.replace('_', ' ')} type={order.status} />
                  <p className="font-black text-gray-900 mt-1.5">US${Number(order.subtotal_usd).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
     </div>
    </div>
  )
}
