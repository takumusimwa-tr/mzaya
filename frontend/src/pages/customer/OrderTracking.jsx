import { useCallback, useEffect, useState } from 'react'
import api from '../../api/api'
import useOrderRealtime from '../../hooks/useOrderRealtime'
import OrderTimeline from '../../components/orders/OrderTimeline'
import OrderStatusPill from '../../components/orders/OrderStatusPill'
import RiderLocationPanel from '../../components/tracking/RiderLocationPanel'
import RealtimeStatus from '../../components/common/RealtimeStatus'
import LoadingState from '../../components/common/LoadingState'
import EmptyState from '../../components/common/EmptyState'

export default function OrderTracking({ token }) {
  const [order, setOrder] = useState(null)
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.get('/live-orders/customer/active')
      .then(({ data }) => {
        if (active) setOrder(data.order)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const onStatusChanged = useCallback((payload) => {
    setOrder((current) => current ? {
      ...current,
      status: payload.status,
      updated_at: payload.updatedAt,
    } : current)
  }, [])

  const onRiderLocation = useCallback((payload) => {
    setLocation(payload)
  }, [])

  const { connected, connectionError } = useOrderRealtime({
    token,
    orderId: order?.id,
    onStatusChanged,
    onRiderLocation,
  })

  if (loading) return <LoadingState label="Loading your order" />
  if (!order) {
    return <EmptyState title="No active order" description="Your current delivery will appear here." />
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Order #{String(order.id).slice(0, 8)}</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">
            Track your order
          </h1>
        </div>
        <RealtimeStatus connected={connected} error={connectionError} />
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <OrderStatusPill status={order.status} />
          {order.estimated_delivery_at ? (
            <p className="text-sm font-semibold text-slate-700">
              ETA {new Date(order.estimated_delivery_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          ) : null}
        </div>
        <div className="mt-6">
          <OrderTimeline status={order.status} timeline={order.timeline} />
        </div>
      </section>

      <RiderLocationPanel location={location} />
    </main>
  )
}
