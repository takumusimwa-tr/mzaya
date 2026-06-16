import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'
import Badge from '../../components/ui/Badge'
import LoadingScreen from '../../components/ui/LoadingScreen'

export default function VendorOrders() {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const { data: orders, isLoading } = useQuery({
    queryKey: ['vendor-orders'],
    queryFn:  () => api.get('/orders/vendor').then((r) => r.data.orders),
    refetchInterval: 15000,
  })

  const acceptOrder = useMutation({
    mutationFn: (orderId) => api.patch(`/orders/${orderId}/status`, { status: 'accepted' }),
    onSuccess:  () => queryClient.invalidateQueries(['vendor-orders']),
  })

  if (isLoading) return <LoadingScreen message="Loading orders..." />

  const pending  = orders?.filter((o) => o.status === 'pending')  || []
  const active   = orders?.filter((o) => ['accepted', 'picked_up', 'en_route'].includes(o.status)) || []
  const past     = orders?.filter((o) => ['delivered', 'cancelled'].includes(o.status)) || []

  return (
    <div className="pb-24">
      <div className="px-4 pt-14 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Orders</h1>
      </div>

      <div className="px-4 flex flex-col gap-5">
        {/* New orders */}
        {pending.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-orange-600 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              New orders ({pending.length})
            </h2>
            <div className="flex flex-col gap-3">
              {pending.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  action={{ label: 'Accept order', color: 'bg-orange-500', onClick: () => acceptOrder.mutate(order.id) }}
                  loading={acceptOrder.isPending}
                />
              ))}
            </div>
          </div>
        )}

        {/* Active orders */}
        {active.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-blue-600 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              In progress ({active.length})
            </h2>
            <div className="flex flex-col gap-3">
              {active.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {/* Past orders */}
        {past.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-500 mb-3">Completed</h2>
            <div className="flex flex-col gap-3">
              {past.slice(0, 10).map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {!orders?.length && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500 text-sm">No orders yet</p>
            <p className="text-gray-400 text-xs mt-1">Orders will appear here when customers place them</p>
          </div>
        )}
      </div>
    </div>
  )
}

function OrderCard({ order, action, loading }) {
  const detail = order.foodDetail || order.groceryDetail || order.materialsDetail

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-mono text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-sm text-gray-500 mt-0.5">→ {order.dropoff_address}</p>
        </div>
        <Badge label={order.status.replace('_', ' ')} type={order.status} />
      </div>

      {detail?.items?.length > 0 && (
        <div className="mb-3">
          {detail.items.map((item, i) => (
            <p key={i} className="text-sm text-gray-700">{item.name} × {item.qty}</p>
          ))}
          {detail.special_instructions && (
            <p className="text-xs text-yellow-700 bg-yellow-50 rounded-lg px-2 py-1 mt-2">
              📝 {detail.special_instructions}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="font-bold text-gray-900">${Number(order.subtotal_usd).toFixed(2)}</p>
        <p className="text-xs text-gray-400">
          {new Date(order.createdAt).toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {action && (
        <button
          onClick={action.onClick}
          disabled={loading}
          className={`w-full mt-3 ${action.color} text-white py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-all disabled:opacity-50`}
        >
          {loading ? 'Processing...' : action.label}
        </button>
      )}
    </div>
  )
}
