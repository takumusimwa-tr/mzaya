import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { orderAPI } from '../../api/api'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

const STATUS_STEPS = ['pending', 'accepted', 'picked_up', 'en_route', 'delivered']

export default function OrderDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn:  () => orderAPI.getOrder(id).then((r) => r.data.order),
    refetchInterval: 15000,
  })

  if (isLoading) return <LoadingScreen message="Loading order..." />
  if (!data)     return <div className="p-6 text-center text-gray-500">Order not found</div>

  const order   = data
  const detail  = order.foodDetail || order.groceryDetail || order.materialsDetail || order.errandDetail
  const stepIdx = STATUS_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'cancelled' || order.status === 'failed'

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-100">
          <BackIcon />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Order details</h1>
          <p className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Status */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-700">Status</h2>
            <Badge label={order.status.replace('_', ' ')} type={order.status} />
          </div>

          {!isCancelled && (
            <div className="flex items-center">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${i <= stepIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 ${i < stepIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delivery info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Delivery</h2>
          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <span className="text-green-500 mt-0.5">↑</span>
              <div>
                <p className="text-xs text-gray-400">Pickup</p>
                <p className="text-sm text-gray-800">{order.pickup_address}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-red-500 mt-0.5">↓</span>
              <div>
                <p className="text-xs text-gray-400">Delivery</p>
                <p className="text-sm text-gray-800">{order.dropoff_address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        {detail?.items?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-700 mb-3">Items</h2>
            {detail.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{item.name} × {item.qty}</span>
                <span>${(item.unit_price_usd * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pricing */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Payment</h2>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Subtotal</span>
            <span>${Number(order.subtotal_usd).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-3">
            <span>Delivery fee</span>
            <span>${Number(order.delivery_fee_usd).toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>${Number(order.total_usd).toFixed(2)}</span>
          </div>
          {order.total_zig && (
            <p className="text-xs text-gray-400 mt-1 text-right">≈ ZiG {Number(order.total_zig).toFixed(2)}</p>
          )}
          <p className="text-xs text-gray-500 mt-2 capitalize">
            Payment: {order.payment_method} · <span className={order.payment_status === 'success' ? 'text-green-600' : 'text-yellow-600'}>{order.payment_status}</span>
          </p>
        </div>

        {/* Cancel button */}
        {['pending', 'accepted'].includes(order.status) && (
          <Button variant="danger" size="lg">
            Cancel order
          </Button>
        )}
      </div>
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
