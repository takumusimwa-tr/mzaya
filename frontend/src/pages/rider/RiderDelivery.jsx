import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/api'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Badge from '../../components/ui/Badge'
import ImageUpload from '../../components/ImageUpload'
import useRiderTracking from '../../hooks/useRiderTracking'

const STATUS_FLOW = {
  accepted:  { next: 'picked_up',  label: 'Mark as Picked Up',  color: 'bg-purple-600' },
  picked_up: { next: 'en_route',   label: 'Start Delivery',     color: 'bg-indigo-600' },
  en_route:  { next: 'delivered',  label: 'Mark as Delivered',  color: 'bg-green-600'  },
}

export default function RiderDelivery() {
  const { id }        = useParams()
  const navigate      = useNavigate()
  const queryClient   = useQueryClient()
  const [proofUrl, setProofUrl] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['rider-order', id],
    queryFn:  () => api.get(`/orders/${id}`).then((r) => r.data.order),
    refetchInterval: 10000,
  })

  const updateStatus = useMutation({
    mutationFn: (status) => api.patch(`/orders/${id}/status`,
      status === 'delivered' ? { status, delivery_proof_url: proofUrl } : { status }),
    onSuccess: (_, status) => {
      queryClient.invalidateQueries(['rider-order', id])
      queryClient.invalidateQueries(['rider-orders'])
      if (status === 'delivered') navigate('/rider')
    },
  })

  // Broadcast GPS while on active delivery
  const isActiveDelivery = data && ['accepted', 'picked_up', 'en_route'].includes(data.status)
  useRiderTracking(isActiveDelivery)

  if (isLoading) return <LoadingScreen message="Loading order..." />
  if (!data)     return <div className="p-6 text-center text-gray-500">Order not found</div>

  const order   = data
  const detail  = order.foodDetail || order.groceryDetail || order.materialsDetail || order.errandDetail
  const nextStep = STATUS_FLOW[order.status]

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-6" style={{ background: '#00A651' }}>
        <button onClick={() => navigate('/rider')} className="bg-white/20 p-2 rounded-full mb-4 inline-block">
          <BackIcon />
        </button>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
            <h1 className="text-white font-bold text-lg capitalize">{order.category_type} delivery</h1>
          </div>
          <Badge label={order.status.replace('_', ' ')} type={order.status} />
        </div>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-4">
        {/* Delivery route */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Delivery route</h2>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-sm font-bold">1</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400">Pick up from</p>
                <p className="text-sm font-semibold text-gray-900">{order.pickup_address}</p>
              </div>
              <NavigateButton loc={order.pickup_location} address={order.pickup_address} />
            </div>
            <div className="ml-4 border-l-2 border-dashed border-gray-200 h-4" />
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-500 text-sm font-bold">2</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400">Deliver to</p>
                <p className="text-sm font-semibold text-gray-900">{order.dropoff_address}</p>
              </div>
              <NavigateButton loc={order.dropoff_location} address={order.dropoff_address} />
            </div>
          </div>
        </div>

        {/* Order items */}
        {detail?.items?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-700 mb-3">Items to deliver</h2>
            {detail.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{item.name} × {item.qty}</span>
                <span className="text-gray-400">{item.qty} pcs</span>
              </div>
            ))}
            {detail.special_instructions && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-xl">
                <p className="text-xs text-yellow-800">📝 {detail.special_instructions}</p>
              </div>
            )}
          </div>
        )}

        {/* Errand details */}
        {order.category_type === 'errand' && detail && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-700 mb-3">Errand details</h2>
            <p className="text-sm text-gray-700">{detail.task_description}</p>
            {detail.documents_required && (
              <div className="mt-3 p-3 bg-green-50 rounded-xl">
                <p className="text-xs text-green-800">📄 Documents: {detail.document_description}</p>
              </div>
            )}
            {detail.cash_float_required && (
              <div className="mt-2 p-3 bg-orange-50 rounded-xl">
                <p className="text-xs text-orange-800">💵 Cash float: ${detail.cash_float_amount_usd}</p>
              </div>
            )}
          </div>
        )}

        {/* Payment */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-2">Payment</h2>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order total</span>
            <span className="font-bold text-gray-900">${Number(order.total_usd).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Payment method</span>
            <span className="capitalize text-gray-700">{order.payment_method}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Payment status</span>
            <span className={`capitalize font-medium ${order.payment_status === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>
              {order.payment_status}
            </span>
          </div>
        </div>
      </div>

      {/* Action button */}
      {nextStep && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-4 bg-gradient-to-t from-white via-white to-transparent pt-4">
          {/* Proof-of-delivery photo required at the final step */}
          {nextStep.next === 'delivered' && (
            <div className="mb-3 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-700 mb-2">📸 Delivery proof photo</p>
              <ImageUpload
                currentUrl={proofUrl}
                onUploaded={(url) => setProofUrl(url)}
                label="Take / upload proof"
                shape="square"
              />
              {!proofUrl && <p className="text-[11px] text-gray-400 mt-2">Required — snap the package at the drop-off.</p>}
            </div>
          )}
          <button
            onClick={() => updateStatus.mutate(nextStep.next)}
            disabled={updateStatus.isPending || (nextStep.next === 'delivered' && !proofUrl)}
            className={`w-full ${nextStep.color} text-white py-4 rounded-2xl text-sm font-bold active:scale-95 transition-all disabled:opacity-50`}
          >
            {updateStatus.isPending ? 'Updating...' : nextStep.label}
          </button>
        </div>
      )}

      {order.status === 'delivered' && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-4 pt-4">
          <div className="w-full bg-green-50 border border-green-200 text-green-700 py-4 rounded-2xl text-sm font-bold text-center">
            ✅ Delivery completed
          </div>
        </div>
      )}
    </div>
  )
}

function NavigateButton({ loc, address }) {
  // Prefer precise coordinates; fall back to the address string.
  const dest = (loc && loc.lat != null && loc.lng != null)
    ? `${loc.lat},${loc.lng}`
    : encodeURIComponent(address || '')
  if (!dest) return null
  const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`

  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform"
      style={{ background: '#EDFAF3', color: '#00A651' }}>
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
      Navigate
    </a>
  )
}

function BackIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}
