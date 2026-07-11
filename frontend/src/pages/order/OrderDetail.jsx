import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderAPI, paymentAPI } from '../../api/api'
import api from '../../api/api'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import useReorder from '../../hooks/useReorder'
import imageUrl from '../../utils/imageUrl'
import useSocketEvent from '../../hooks/useSocketEvent'
import { negotiationAPI } from '../../api/api'
import PaymentPanel from '../../components/PaymentPanel'
import OrderChat from '../../components/OrderChat'
import Icon from '../../components/ui/Icon'

const STATUS_STEPS = ['pending', 'accepted', 'picked_up', 'en_route', 'delivered']

export default function OrderDetail() {
  const { id }        = useParams()
  const navigate      = useNavigate()
  const queryClient   = useQueryClient()
  const [rating, setRating]     = useState(0)
  const [hovered, setHovered]   = useState(0)
  const [review, setReview]     = useState('')
  const [showChat, setShowChat] = useState(false)
  const [rated,  setRated]      = useState(false)
  const reorder = useReorder()

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn:  () => orderAPI.getOrder(id).then((r) => r.data.order),
    refetchInterval: 20000, // fallback; real-time drives updates
  })

  // Real-time: refresh when this order's status changes.
  useSocketEvent('order:updated', (payload) => {
    if (payload?.orderId === id) queryClient.invalidateQueries(['order', id])
  }, [id])

  // ── Fare negotiation: incoming offers (only for negotiable, unassigned orders) ──
  const isAwaitingOffers = data?.is_negotiable && !data?.rider_id && data?.status === 'pending'

  const { data: offers } = useQuery({
    queryKey: ['order-offers', id],
    queryFn:  () => negotiationAPI.offers(id).then((r) => r.data.offers),
    enabled:  !!isAwaitingOffers,
    refetchInterval: isAwaitingOffers ? 15000 : false,
  })

  // Live: a new offer arrived, or one was chosen → refresh offers + order.
  useSocketEvent('offer:new', (payload) => {
    if (payload?.orderId === id) queryClient.invalidateQueries(['order-offers', id])
  }, [id])

  const chooseOffer = useMutation({
    mutationFn: (offerId) => negotiationAPI.chooseOffer(id, offerId),
    onSuccess:  () => {
      queryClient.invalidateQueries(['order', id])
      queryClient.invalidateQueries(['order-offers', id])
    },
  })

  // Returning from a Paynow (or mock) card redirect → poll to confirm payment.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('mockpay') || params.get('paynow')) {
      paymentAPI.poll(id).finally(() => {
        queryClient.invalidateQueries(['order', id])
        // clean the URL
        window.history.replaceState({}, '', `/orders/${id}`)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const cancelMutation = useMutation({
    mutationFn: () => orderAPI.cancel(id, 'Cancelled by customer'),
    onSuccess:  () => queryClient.invalidateQueries(['order', id]),
  })

  const submitRating = useMutation({
    mutationFn: () => api.post(`/orders/${id}/rate`, { rating, review }),
    onSuccess:  () => setRated(true),
  })

  if (isLoading) return <LoadingScreen message="Loading order..." />
  if (!data)     return <div className="p-6 text-center text-gray-500">Order not found</div>

  const order       = data
  const detail      = order.foodDetail || order.groceryDetail || order.materialsDetail || order.errandDetail
  const stepIdx     = STATUS_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'cancelled' || order.status === 'failed'
  const isDelivered = order.status === 'delivered'

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
        {/* Track button */}
        {!isCancelled && !isDelivered && (
          <button
            onClick={() => navigate(`/track/${order.id}`)}
            className="ml-auto bg-green-600 text-white text-xs px-3 py-2 rounded-xl font-semibold"
          >
            Track →
          </button>
        )}
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

        {/* Delivery */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Delivery</h2>
          <div className="flex gap-3 mb-2">
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

        {/* Chat with rider/store while the order is active */}
        {!isCancelled && !isDelivered && order.status !== 'pending' && (
          <button onClick={() => setShowChat(true)}
            className="w-full py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2 active:scale-98"
            style={{ background: '#00A651' }}>
            <Icon name="chat" size={15} className="inline" /> Message rider & store
          </button>
        )}

        {/* Payment — show until the order is paid */}
        {order.payment_status !== 'success' && order.status !== 'cancelled' && (
          <PaymentPanel order={order} onPaid={() => queryClient.invalidateQueries(['order', id])} />
        )}

        {/* Fare negotiation — incoming rider offers */}
        {isAwaitingOffers && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-gray-700">Rider offers</h2>
              <span className="text-xs text-gray-400">Your fare: ${Number(order.offered_fare_usd).toFixed(2)}</span>
            </div>
            {!offers?.length ? (
              <div className="py-6 text-center">
                <div className="mb-2 flex justify-center animate-pulse text-gray-400"><Icon name="waiting" size={30} /></div>
                <p className="text-sm text-gray-500">Waiting for riders to respond…</p>
                <p className="text-xs text-gray-400 mt-1">They can accept your fare or propose a price.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                {offers.map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{o.rider?.name || 'Rider'}</p>
                        {o.type === 'counter'
                          ? <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">Counter</span>
                          : <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-green-50" style={{ color: '#00A651' }}>Accepts</span>
                        }
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {o.rider_profile?.vehicle_type?.replace('_', ' ') || 'vehicle'}
                        {o.rider_profile?.total_deliveries != null && ` · ${o.rider_profile.total_deliveries} trips`}
                        {o.rider_profile?.rating > 0 && ` · ⭐ ${Number(o.rider_profile.rating).toFixed(1)}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">${Number(o.amount_usd).toFixed(2)}</p>
                      <button onClick={() => chooseOffer.mutate(o.id)} disabled={chooseOffer.isPending}
                        className="mt-1 px-4 py-1.5 rounded-lg text-white text-xs font-bold active:scale-95 disabled:opacity-50"
                        style={{ background: '#00A651' }}>
                        Choose
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Proof of delivery — shown once delivered */}
        {isDelivered && order.delivery_proof_url && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-700 mb-3"><Icon name="camera" size={14} className="inline" /> Proof of delivery</h2>
            <img src={imageUrl(order.delivery_proof_url, 800)} alt="Delivery proof"
              className="w-full rounded-xl object-cover max-h-72" />
            <p className="text-xs text-gray-400 mt-2">Photo taken by your rider at drop-off.</p>
          </div>
        )}

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
            {/* Reorder — show for finished orders */}
            {(isDelivered || isCancelled) && (
              <button onClick={() => reorder(order)}
                className="w-full mt-3 py-3 rounded-xl font-bold text-sm active:scale-98 transition-transform border-2"
                style={{ borderColor: '#00A651', color: '#00A651', background: '#EDFAF3' }}>
                <Icon name="reorder" size={15} className="inline" /> Reorder these items
              </button>
            )}
          </div>
        )}

        {/* Payment */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Payment</h2>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Subtotal</span><span>${Number(order.subtotal_usd).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-3">
            <span>Delivery fee</span><span>${Number(order.delivery_fee_usd).toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
            <span>Total</span><span>${Number(order.total_usd).toFixed(2)}</span>
          </div>
          {order.total_zig && (
            <p className="text-xs text-gray-400 mt-1 text-right">≈ ZiG {Number(order.total_zig).toFixed(2)}</p>
          )}
          <p className="text-xs text-gray-500 mt-2 capitalize">
            Payment: {order.payment_method} ·{' '}
            <span className={order.payment_status === 'success' ? 'text-green-600' : 'text-yellow-600'}>
              {order.payment_status}
            </span>
          </p>
        </div>

        {/* Rating — shown only after delivery */}
        {isDelivered && !rated && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-700 mb-3">Rate your experience</h2>
            <div className="flex justify-center gap-3 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  className="text-3xl transition-transform active:scale-90"
                >
                  {star <= (hovered || rating) ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            {rating > 0 && (
              <>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Tell us about your experience (optional)"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 resize-none mb-3"
                />
                <Button
                  size="lg"
                  loading={submitRating.isPending}
                  onClick={() => submitRating.mutate()}
                >
                  Submit rating
                </Button>
              </>
            )}
          </div>
        )}

        {rated && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">🙏</p>
            <p className="text-sm font-bold text-green-700">Thank you for your rating!</p>
          </div>
        )}

        {/* Cancel button */}
        {['pending', 'accepted'].includes(order.status) && (
          <Button
            variant="danger"
            size="lg"
            loading={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
          >
            Cancel order
          </Button>
        )}
      </div>

      {showChat && <OrderChat orderId={id} onClose={() => setShowChat(false)} />}
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
