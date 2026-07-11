import { useQuery } from '@tanstack/react-query'
import api from '../../api/api'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Icon from '../../components/ui/Icon'

export default function RiderEarnings() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['rider-completed'],
    queryFn:  () => api.get('/orders/my').then((r) => r.data.orders),
  })

  if (isLoading) return <LoadingScreen message="Loading earnings..." />

  const completed  = orders?.filter((o) => o.status === 'delivered') || []
  const totalEarnings = completed.reduce((sum, o) => sum + Number(o.delivery_fee_usd || 0), 0)
  const todayOrders   = completed.filter((o) => {
    const today = new Date().toDateString()
    return new Date(o.createdAt).toDateString() === today
  })
  const todayEarnings = todayOrders.reduce((sum, o) => sum + Number(o.delivery_fee_usd || 0), 0)

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-blue-600 px-4 pt-12 pb-6">
        <p className="text-blue-100 text-xs">Your earnings</p>
        <h1 className="text-white font-bold text-2xl mt-1">${totalEarnings.toFixed(2)}</h1>
        <p className="text-blue-200 text-xs mt-0.5">All time · {completed.length} deliveries</p>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-4">
        {/* Today summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-blue-600">${todayEarnings.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Today's earnings</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-blue-600">{todayOrders.length}</p>
            <p className="text-xs text-gray-500 mt-1">Today's deliveries</p>
          </div>
        </div>

        {/* Delivery history */}
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-3">Delivery history</h2>
          {completed.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <div className="mb-3 flex justify-center text-gray-300"><Icon name="parcel" size={40} /></div>
              <p className="text-gray-500 text-sm">No completed deliveries yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {completed.slice(0, 20).map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize mt-0.5">{order.category_type}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-ZW', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">${Number(order.delivery_fee_usd || 0).toFixed(2)}</p>
                    <p className="text-xs text-green-500 mt-0.5">✓ Delivered</p>
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
