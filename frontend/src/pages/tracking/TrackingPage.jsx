import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { orderAPI } from '../../api/api'
import Badge from '../../components/ui/Badge'
import LoadingScreen from '../../components/ui/LoadingScreen'

const STATUS_INFO = {
  pending:   { label: 'Finding a rider',    icon: '🔍', desc: 'We are looking for an available rider' },
  accepted:  { label: 'Rider assigned',     icon: '🏍️', desc: 'Your rider is heading to the pickup' },
  picked_up: { label: 'Order picked up',    icon: '📦', desc: 'Your order is on the way' },
  en_route:  { label: 'On the way',         icon: '🚀', desc: 'Almost there!' },
  delivered: { label: 'Delivered',          icon: '✅', desc: 'Your order has been delivered' },
  cancelled: { label: 'Order cancelled',    icon: '❌', desc: 'This order was cancelled' },
}

export default function TrackingPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['track', id],
    queryFn:  () => orderAPI.getOrder(id).then((r) => r.data.order),
    refetchInterval: 10000,
  })

  if (isLoading) return <LoadingScreen message="Loading tracking..." />
  if (!data)     return <div className="p-6 text-center text-gray-500">Order not found</div>

  const order  = data
  const info   = STATUS_INFO[order.status] || STATUS_INFO.pending

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-100">
          <BackIcon />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Track order</h1>
      </div>

      {/* Map placeholder */}
      <div className="h-56 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-2">🗺️</p>
          <p className="text-sm text-gray-500">Live map coming soon</p>
        </div>
      </div>

      {/* Status card */}
      <div className="mx-4 -mt-6 bg-white rounded-2xl shadow-md p-5 z-10 relative">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{info.icon}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-900">{info.label}</p>
              <Badge label={order.status.replace('_', ' ')} type={order.status} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{info.desc}</p>
          </div>
        </div>

        {order.rider_id && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span>🏍️</span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Your rider</p>
              <p className="text-sm font-semibold text-gray-900">Rider assigned</p>
            </div>
          </div>
        )}
      </div>

      {/* Order info */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex gap-3 mb-3">
          <span className="text-green-500">↑</span>
          <div>
            <p className="text-xs text-gray-400">Pickup</p>
            <p className="text-sm text-gray-800">{order.pickup_address}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="text-red-500">↓</span>
          <div>
            <p className="text-xs text-gray-400">Delivery</p>
            <p className="text-sm text-gray-800">{order.dropoff_address}</p>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">Updates every 10 seconds</p>
    </div>
  )
}

function BackIcon() {
  return (
    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}
