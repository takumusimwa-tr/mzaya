import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { orderAPI } from '../../api/api'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Badge from '../../components/ui/Badge'
import useReorder from '../../hooks/useReorder'

export default function OrdersPage() {
  const navigate = useNavigate()
  const reorder  = useReorder()

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn:  () => orderAPI.myOrders().then((r) => r.data.orders),
    refetchInterval: 30000,
  })

  if (isLoading) return <LoadingScreen message="Loading orders..." />

  return (
    <div className="pb-24">
      <div className="px-4 pt-14 pb-4">
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
      </div>

      {!orders?.length ? (
        <div className="flex flex-col items-center justify-center py-24 px-6">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-600 font-semibold">No orders yet</p>
          <p className="text-gray-400 text-sm text-center mt-1">Your orders will appear here</p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <button onClick={() => navigate(`/orders/${order.id}`)}
                className="w-full text-left active:scale-98 transition-transform">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="font-semibold text-gray-900 mt-0.5 capitalize">{order.category_type} order</p>
                  </div>
                  <Badge label={order.status.replace('_', ' ')} type={order.status} />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-500">{order.pickup_address}</p>
                  <p className="font-bold text-green-600">${Number(order.total_usd).toFixed(2)}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(order.createdAt).toLocaleDateString('en-ZW', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </button>
              {/* Quick reorder for finished orders */}
              {(order.status === 'delivered' || order.status === 'cancelled') && (
                <button onClick={() => reorder(order)}
                  className="w-full mt-3 py-2.5 rounded-xl font-bold text-sm active:scale-98 transition-transform border"
                  style={{ borderColor: '#FF3008', color: '#FF3008' }}>
                  🔄 Reorder
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
