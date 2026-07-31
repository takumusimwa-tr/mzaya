import { useCallback, useEffect, useState } from 'react'
import api from '../../api/api'
import useOrderRealtime from '../../hooks/useOrderRealtime'
import OrderTimeline from '../../components/orders/OrderTimeline'
import OrderStatusPill from '../../components/orders/OrderStatusPill'
import RealtimeStatus from '../../components/common/RealtimeStatus'
import LoadingState from '../../components/common/LoadingState'
import EmptyState from '../../components/common/EmptyState'

export default function CurrentDelivery({ token }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/live-orders/rider/current')
      .then(({ data }) => setOrder(data.order))
      .finally(() => setLoading(false))
  }, [])

  const onStatusChanged = useCallback((payload) => {
    setOrder((current) => current ? { ...current, status: payload.status } : current)
  }, [])

  const { connected, connectionError } = useOrderRealtime({
    token,
    orderId: order?.id,
    onStatusChanged,
  })

  async function transition(status) {
    await api.post(`/orders/${order.id}/transition`, { status })
    setOrder((current) => ({ ...current, status }))
  }

  if (loading) return <LoadingState label="Loading current delivery" />
  if (!order) {
    return <EmptyState title="No active delivery" description="Accepted deliveries appear here." />
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Order #{String(order.id).slice(0, 8)}</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">
            Current delivery
          </h1>
        </div>
        <RealtimeStatus connected={connected} error={connectionError} />
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <OrderStatusPill status={order.status} />
        <div className="mt-6">
          <OrderTimeline status={order.status} timeline={order.timeline} />
        </div>

        <div className="mt-6">
          {['rider_assigned', 'accepted'].includes(order.status) ? (
            <button
              onClick={() => transition('picked_up')}
              className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white"
            >
              Confirm pickup
            </button>
          ) : null}
          {order.status === 'picked_up' ? (
            <button
              onClick={() => transition('en_route')}
              className="w-full rounded-xl bg-emerald-800 px-4 py-3 font-semibold text-white"
            >
              Start delivery
            </button>
          ) : null}
          {order.status === 'en_route' ? (
            <button
              onClick={() => transition('delivered')}
              className="w-full rounded-xl bg-emerald-800 px-4 py-3 font-semibold text-white"
            >
              Confirm delivery
            </button>
          ) : null}
        </div>
      </section>
    </main>
  )
}
