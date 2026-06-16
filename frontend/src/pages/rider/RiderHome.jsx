import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'
import useAuthStore from '../../store/useAuthStore'
import Badge from '../../components/ui/Badge'
import LoadingScreen from '../../components/ui/LoadingScreen'

export default function RiderHome() {
  const user         = useAuthStore((s) => s.user)
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const [online, setOnline] = useState(false)

  // Get available + active orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['rider-orders'],
    queryFn:  () => api.get('/orders/my').then((r) => r.data.orders),
    refetchInterval: 15000,
  })

  // Toggle online status
  const toggleOnline = useMutation({
    mutationFn: () => api.patch('/riders/online', { is_online: !online }),
    onSuccess:  () => setOnline((prev) => !prev),
  })

  // Accept an order
  const acceptOrder = useMutation({
    mutationFn: (orderId) => api.patch(`/orders/${orderId}/status`, { status: 'accepted' }),
    onSuccess:  () => queryClient.invalidateQueries(['rider-orders']),
  })

  if (isLoading) return <LoadingScreen message="Loading deliveries..." />

  const activeOrders  = orders?.filter((o) => ['accepted', 'picked_up', 'en_route'].includes(o.status)) || []
  const pendingOrders = orders?.filter((o) => o.status === 'pending') || []

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-blue-600 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-xs">Rider dashboard</p>
            <h1 className="text-white font-bold text-lg">{user?.name?.split(' ')[0]}</h1>
          </div>
          {/* Online toggle */}
          <button
            onClick={() => toggleOnline.mutate()}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all
              ${online ? 'bg-green-400 text-white' : 'bg-white/20 text-white'}`}
          >
            <span className={`w-2 h-2 rounded-full ${online ? 'bg-white' : 'bg-gray-400'}`} />
            {online ? 'Online' : 'Offline'}
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-white font-bold text-xl">{activeOrders.length}</p>
            <p className="text-blue-100 text-xs">Active</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-white font-bold text-xl">{pendingOrders.length}</p>
            <p className="text-blue-100 text-xs">Available</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-5">
        {/* Active deliveries */}
        {activeOrders.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-3">Active deliveries</h2>
            <div className="flex flex-col gap-3">
              {activeOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => navigate(`/rider/delivery/${order.id}`)}
                  className="w-full text-left bg-blue-50 border border-blue-200 rounded-2xl p-4 active:scale-98"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-mono text-blue-400">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="font-bold text-gray-900 capitalize mt-0.5">{order.category_type} order</p>
                    </div>
                    <Badge label={order.status.replace('_', ' ')} type={order.status} />
                  </div>
                  <div className="flex gap-2 text-xs text-gray-600">
                    <span>↑</span><span className="truncate">{order.pickup_address}</span>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-600 mt-1">
                    <span>↓</span><span className="truncate">{order.dropoff_address}</span>
                  </div>
                  <p className="text-right font-bold text-blue-600 mt-2">${Number(order.total_usd).toFixed(2)}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Available orders */}
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-3">
            {online ? 'Available orders' : 'Go online to see orders'}
          </h2>

          {!online ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-3">🏍️</p>
              <p className="text-gray-500 text-sm">You are offline</p>
              <p className="text-gray-400 text-xs mt-1">Toggle online to start receiving orders</p>
            </div>
          ) : pendingOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-3">⏳</p>
              <p className="text-gray-500 text-sm">No orders available right now</p>
              <p className="text-gray-400 text-xs mt-1">New orders will appear here</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-mono text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="font-bold text-gray-900 capitalize mt-0.5">{order.category_type} order</p>
                    </div>
                    <p className="font-bold text-green-600">${Number(order.total_usd).toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-600 mb-1">
                    <span className="text-green-500">↑</span>
                    <span className="truncate">{order.pickup_address}</span>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-600 mb-4">
                    <span className="text-red-500">↓</span>
                    <span className="truncate">{order.dropoff_address}</span>
                  </div>
                  <button
                    onClick={() => acceptOrder.mutate(order.id)}
                    disabled={acceptOrder.isPending}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-all disabled:opacity-50"
                  >
                    Accept delivery
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
