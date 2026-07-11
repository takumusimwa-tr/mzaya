import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { negotiationAPI } from '../../api/api'
import useSocketEvent from '../../hooks/useSocketEvent'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Icon from '../../components/ui/Icon'

export default function RiderNegotiate() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: orders, isLoading } = useQuery({
    queryKey: ['negotiable-orders'],
    queryFn:  () => negotiationAPI.negotiable().then((r) => r.data.orders),
    refetchInterval: 15000,
  })

  // Live: new negotiable order posted, or one got taken.
  useSocketEvent('order:new', () => queryClient.invalidateQueries(['negotiable-orders']), [])
  useSocketEvent('order:updated', () => queryClient.invalidateQueries(['negotiable-orders']), [])
  // If one of my offers gets chosen, jump to the delivery.
  useSocketEvent('offer:chosen', (payload) => {
    queryClient.invalidateQueries(['rider-orders'])
    if (payload?.orderId) navigate(`/rider/delivery/${payload.orderId}`)
  }, [])

  if (isLoading) return <LoadingScreen message="Finding bargainable jobs..." />

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 pt-12 pb-6" style={{ background: '#00A651' }}>
        <button onClick={() => navigate('/rider')} className="text-white/80 text-sm mb-3">← Back</button>
        <h1 className="text-2xl font-black text-white">Name-your-fare jobs</h1>
        <p className="text-white/80 text-sm mt-1">Accept the customer's price or propose your own.</p>
      </div>

      <div className="px-4 mt-4">
        {!orders?.length ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <div className="mb-3 flex justify-center text-gray-300"><Icon name="negotiate" size={48} /></div>
            <p className="font-bold text-gray-800 mb-1">No open offers right now</p>
            <p className="text-sm text-gray-400">New name-your-fare jobs will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <NegotiableCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NegotiableCard({ order }) {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState(null)          // null | 'counter'
  const [counter, setCounter] = useState('')
  const alreadyOffered = order.my_offer

  const makeOffer = useMutation({
    mutationFn: (payload) => negotiationAPI.makeOffer(order.id, payload),
    onSuccess:  () => {
      queryClient.invalidateQueries(['negotiable-orders'])
      setMode(null); setCounter('')
    },
  })

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs text-gray-300 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="font-bold text-gray-900 capitalize mt-0.5">{order.category_type}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Offered fare</p>
          <p className="font-black text-gray-900 text-xl">${Number(order.offered_fare_usd).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-3 mb-3">
        <p className="text-xs text-gray-600 flex gap-2 mb-1">
          <span className="text-green-500 font-bold">↑</span><span className="truncate">{order.pickup_address}</span>
        </p>
        <p className="text-xs text-gray-600 flex gap-2">
          <span className="text-red-500 font-bold">↓</span><span className="truncate">{order.dropoff_address}</span>
        </p>
      </div>

      {alreadyOffered ? (
        <div className="text-center py-2 rounded-xl bg-green-50 text-sm font-semibold" style={{ color: '#00A651' }}>
          ✓ You offered ${Number(alreadyOffered.amount_usd).toFixed(2)} — waiting for the customer
        </div>
      ) : mode === 'counter' ? (
        <div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 mb-2">
            <span className="text-gray-400 font-bold">$</span>
            <input type="number" inputMode="decimal" value={counter} autoFocus
              onChange={(e) => setCounter(e.target.value)}
              placeholder="Your price"
              className="flex-1 bg-transparent font-bold text-gray-900 outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setMode(null); setCounter('') }}
              className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-600 text-sm font-semibold">
              Cancel
            </button>
            <button
              onClick={() => { const a = parseFloat(counter); if (a > 0) makeOffer.mutate({ type: 'counter', amount_usd: a }) }}
              disabled={makeOffer.isPending || !(parseFloat(counter) > 0)}
              className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
              style={{ background: '#00A651' }}>
              Send offer
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button onClick={() => setMode('counter')}
            className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-bold active:scale-95">
            Counter
          </button>
          <button onClick={() => makeOffer.mutate({ type: 'accept' })} disabled={makeOffer.isPending}
            className="flex-1 py-2.5 rounded-lg text-white text-sm font-bold active:scale-95 disabled:opacity-50"
            style={{ background: '#00A651' }}>
            {makeOffer.isPending ? '…' : `Accept $${Number(order.offered_fare_usd).toFixed(2)}`}
          </button>
        </div>
      )}
    </div>
  )
}
