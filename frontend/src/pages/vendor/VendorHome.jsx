import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'
import useAuthStore from '../../store/useAuthStore'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Badge from '../../components/ui/Badge'

export default function VendorHome() {
  const user        = useAuthStore((s) => s.user)
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const { data: vendorData, isLoading } = useQuery({
    queryKey: ['my-vendor'],
    queryFn:  () => api.get('/vendors/my').then((r) => r.data.vendor),
  })

  const { data: orders } = useQuery({
    queryKey: ['vendor-orders'],
    queryFn:  () => api.get('/orders/vendor').then((r) => r.data.orders),
    refetchInterval: 20000,
  })

  const toggleOpen = useMutation({
    mutationFn: () => api.put(`/vendors/${vendorData?.id}`, { is_open: !vendorData?.is_open }),
    onSuccess:  () => queryClient.invalidateQueries(['my-vendor']),
  })

  if (isLoading) return <LoadingScreen message="Loading dashboard..." />

  const pending   = orders?.filter((o) => o.status === 'pending')   || []
  const active    = orders?.filter((o) => ['accepted', 'picked_up', 'en_route'].includes(o.status)) || []
  const delivered = orders?.filter((o) => o.status === 'delivered') || []
  const revenue   = delivered.reduce((sum, o) => sum + Number(o.subtotal_usd || 0), 0)

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-orange-500 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-orange-100 text-xs">Vendor dashboard</p>
            <h1 className="text-white font-bold text-lg">{vendorData?.name || user?.name}</h1>
          </div>
          {/* Open/Close toggle */}
          <button
            onClick={() => toggleOpen.mutate()}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all
              ${vendorData?.is_open ? 'bg-green-400 text-white' : 'bg-white/20 text-white'}`}
          >
            <span className={`w-2 h-2 rounded-full ${vendorData?.is_open ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
            {vendorData?.is_open ? 'Open' : 'Closed'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-white font-bold text-xl">{pending.length}</p>
            <p className="text-orange-100 text-xs">New</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-white font-bold text-xl">{active.length}</p>
            <p className="text-orange-100 text-xs">Active</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-white font-bold text-lg">${revenue.toFixed(0)}</p>
            <p className="text-orange-100 text-xs">Revenue</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-4">
        {/* New orders alert */}
        {pending.length > 0 && (
          <button
            onClick={() => navigate('/vendor/orders')}
            className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between active:scale-98"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-bounce">🔔</span>
              <div className="text-left">
                <p className="font-bold text-red-700">{pending.length} new order{pending.length > 1 ? 's' : ''}</p>
                <p className="text-xs text-red-500">Tap to view and accept</p>
              </div>
            </div>
            <span className="text-red-400">›</span>
          </button>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/vendor/orders')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left active:scale-98"
          >
            <p className="text-2xl mb-2">📋</p>
            <p className="text-sm font-bold text-gray-900">Orders</p>
            <p className="text-xs text-gray-400">{(pending.length + active.length)} active</p>
          </button>
          <button
            onClick={() => navigate('/vendor/menu')}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left active:scale-98"
          >
            <p className="text-2xl mb-2">🍽️</p>
            <p className="text-sm font-bold text-gray-900">Menu</p>
            <p className="text-xs text-gray-400">{vendorData?.menuItems?.length || 0} items</p>
          </button>
        </div>

        {/* Recent orders */}
        {orders?.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-3">Recent orders</h2>
            <div className="flex flex-col gap-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{order.dropoff_address}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge label={order.status.replace('_', ' ')} type={order.status} />
                    <p className="font-bold text-gray-900 mt-2">${Number(order.subtotal_usd).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
