import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'
import useAuthStore from '../../store/useAuthStore'
import Badge from '../../components/ui/Badge'
import LoadingScreen from '../../components/ui/LoadingScreen'
import { sendNotification } from '../../hooks/useNotifications'

const QUOTES = [
  "The mzaya never refuses.",
  "Ready. Harare is waiting.",
  "Fast hands, fast wheels.",
  "Every delivery tells a story.",
  "Your city is counting on you.",
]

export default function RiderHome() {
  const user        = useAuthStore((s) => s.user)
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const [online, setOnline] = useState(false)
  const prevOrders  = useRef([])
  const quote       = QUOTES[new Date().getMinutes() % QUOTES.length]

  // Fetch real online status from rider profile
  const { data: riderProfile } = useQuery({
    queryKey: ['rider-profile'],
    queryFn:  () => api.get('/riders/profile').then((r) => r.data.rider),
  })

  useEffect(() => {
    if (riderProfile) setOnline(riderProfile.is_online)
  }, [riderProfile])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // My assigned/active orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['rider-orders'],
    queryFn:  () => api.get('/orders/my').then((r) => r.data.orders),
    refetchInterval: online ? 10000 : 30000,
  })

  // Available unclaimed orders in my city
  const { data: available } = useQuery({
    queryKey: ['available-orders'],
    queryFn:  () => api.get('/orders/available').then((r) => r.data.orders),
    refetchInterval: online ? 8000 : false,
    enabled:  online,
    onSuccess: (data) => {
      const count = data?.length || 0
      if (count > prevOrders.current.length) {
        sendNotification('📦 New delivery available', 'A new order is waiting. Tap to accept.', () => navigate('/rider'))
      }
      prevOrders.current = data || []
    },
  })

  const toggleOnline = useMutation({
    mutationFn: () => api.patch('/riders/online', { is_online: !online }),
    onSuccess:  () => {
      setOnline((p) => !p)
      queryClient.invalidateQueries(['rider-profile'])
    },
  })

  const acceptOrder = useMutation({
    mutationFn: (id) => api.post(`/orders/${id}/claim`),
    onSuccess:  () => {
      queryClient.invalidateQueries(['rider-orders'])
      queryClient.invalidateQueries(['available-orders'])
      sendNotification('✅ Order accepted', 'Head to the pickup now.')
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Could not claim order')
      queryClient.invalidateQueries(['available-orders'])
    },
  })

  if (isLoading) return <LoadingScreen message="Loading deliveries..." />

  const active    = orders?.filter((o) => ['accepted', 'picked_up', 'en_route'].includes(o.status)) || []
  const pending   = available || []
  const completed = orders?.filter((o) => o.status === 'delivered').length || 0

  return (
    <div className="pb-24 min-h-screen" style={{ background: '#F7F7F7' }}>

      {/* Hero */}
      <div className="px-4 pt-12 pb-6 relative"
        style={{ background: online ? '#0F172A' : '#1E293B' }}>

        <div className="relative flex items-start justify-between mb-1">
          <div className="flex-1">
            <p className="text-xs tracking-widest font-bold uppercase mb-1"
              style={{ color: online ? '#60A5FA' : '#64748B', letterSpacing: '0.15em' }}>
              MZAYA
            </p>
            <h1 className="text-white font-black text-3xl leading-none">
              {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-xs mt-1.5 italic" style={{ color: '#64748B' }}>{quote}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Online toggle */}
            <button
              onClick={() => toggleOnline.mutate()}
              disabled={toggleOnline.isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95"
              style={online
                ? { background: '#3B82F6', color: '#fff', boxShadow: '0 0 20px #3B82F640' }
                : { background: '#1E293B', color: '#64748B', border: '1.5px solid #334155' }
              }>
              <span className={`w-2 h-2 rounded-full ${online ? 'bg-white animate-pulse' : 'bg-slate-600'}`} />
              {online ? 'Online' : 'Go online'}
            </button>

            {/* Profile avatar */}
            <button
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#94A3B8' }}>
              {user?.name?.charAt(0)}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          {[
            { label: 'On delivery', value: active.length,  accent: online ? '#60A5FA' : '#475569' },
            { label: 'Available',   value: pending.length, accent: pending.length > 0 && online ? '#FCD34D' : (online ? '#60A5FA' : '#475569') },
            { label: 'Completed',   value: completed,      accent: online ? '#34D399' : '#475569' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-3 text-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-2xl font-black" style={{ color: s.accent }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-4">
        {/* Active deliveries */}
        {active.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">On delivery</p>
            {active.map((order) => (
              <button key={order.id} onClick={() => navigate(`/rider/delivery/${order.id}`)}
                className="w-full text-left rounded-2xl p-4 mb-3 active:scale-98"
                style={{ background: '#0F172A', boxShadow: '0 4px 20px rgba(59,130,246,0.2)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge label={order.status.replace('_', ' ')} type={order.status} />
                    <p className="font-bold text-white capitalize mt-1.5">{order.category_type}</p>
                  </div>
                  <p className="font-black text-white text-xl">${Number(order.total_usd).toFixed(2)}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <p className="text-xs text-slate-400 flex gap-2 mb-1">
                    <span className="text-green-400">↑</span>{order.pickup_address}
                  </p>
                  <p className="text-xs text-slate-400 flex gap-2">
                    <span className="text-red-400">↓</span>{order.dropoff_address}
                  </p>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-right">Tap to update →</p>
              </button>
            ))}
          </div>
        )}

        {/* Offline state */}
        {!online ? (
          <div className="bg-white rounded-3xl p-8 text-center"
            style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <div className="text-6xl mb-4">🏍️</div>
            <h2 className="font-black text-gray-900 text-xl mb-1">You're off duty</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
              Go online to start receiving delivery requests from Harare and beyond
            </p>
            <button onClick={() => toggleOnline.mutate()}
              className="px-8 py-3.5 rounded-2xl font-black text-white text-sm active:scale-95 transition-all"
              style={{ background: '#0F172A', boxShadow: '0 4px 14px rgba(15,23,42,0.3)' }}>
              Start my shift
            </button>
          </div>
        ) : pending.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center"
            style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <div className="text-5xl mb-3 animate-pulse">⏳</div>
            <h2 className="font-bold text-gray-900 mb-1">Waiting for orders</h2>
            <p className="text-gray-400 text-sm">Stay nearby — new orders refresh every 10 seconds</p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              New requests · {pending.length}
            </p>
            {pending.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 mb-3"
                style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-300 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="font-bold text-gray-900 capitalize mt-0.5">{order.category_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900 text-xl">${Number(order.total_usd).toFixed(2)}</p>
                      <p className="text-xs text-green-600 font-semibold">
                        +${Number(order.delivery_fee_usd || 0).toFixed(2)} fee
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <p className="text-xs text-gray-600 flex gap-2 mb-1">
                      <span className="text-green-500 font-bold">↑</span>
                      <span className="truncate">{order.pickup_address}</span>
                    </p>
                    <p className="text-xs text-gray-600 flex gap-2">
                      <span className="text-red-500 font-bold">↓</span>
                      <span className="truncate">{order.dropoff_address}</span>
                    </p>
                  </div>
                  <button onClick={() => acceptOrder.mutate(order.id)}
                    disabled={acceptOrder.isPending}
                    className="w-full py-3.5 rounded-xl font-black text-white text-sm active:scale-95 transition-all disabled:opacity-50"
                    style={{ background: '#0F172A' }}>
                    {acceptOrder.isPending ? 'Accepting...' : 'Accept delivery'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
