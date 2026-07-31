import { useCallback, useEffect, useState } from 'react'
import api from '../../api/api'
import useVendorLiveOrders from '../../hooks/useVendorLiveOrders'
import LiveOrderCard from '../../components/orders/LiveOrderCard'
import RealtimeStatus from '../../components/common/RealtimeStatus'
import LoadingState from '../../components/common/LoadingState'
import EmptyState from '../../components/common/EmptyState'

export default function LiveOrders({ token, vendorId }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.get(`/live-orders/vendor/${vendorId}`)
      .then(({ data }) => {
        if (active) setOrders(data.orders || [])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [vendorId])

  const upsert = useCallback((payload) => {
    setOrders((current) => {
      const id = payload.orderId || payload.id
      const existing = current.find((order) => order.id === id)
      if (!existing) return [{ ...payload, id }, ...current]
      return current.map((order) =>
        order.id === id
          ? { ...order, ...payload, id, status: payload.status || order.status }
          : order
      )
    })
  }, [])

  const { connected, connectionError } = useVendorLiveOrders({
    token,
    vendorId,
    onNewOrder: upsert,
    onOrderChanged: upsert,
  })

  async function transition(orderId, status) {
    await api.post(`/orders/${orderId}/transition`, { status })
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    )
  }

  if (loading) return <LoadingState label="Loading live orders" />

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Operations</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">Live orders</h1>
        </div>
        <RealtimeStatus connected={connected} error={connectionError} />
      </header>

      {orders.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <LiveOrderCard
              key={order.id}
              order={order}
              actions={
                <div className="flex gap-2">
                  {order.status === 'placed' ? (
                    <button
                      className="flex-1 rounded-xl bg-emerald-800 px-3 py-2 text-sm font-semibold text-white"
                      onClick={() => transition(order.id, 'confirmed')}
                    >
                      Confirm
                    </button>
                  ) : null}
                  {order.status === 'confirmed' ? (
                    <button
                      className="flex-1 rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white"
                      onClick={() => transition(order.id, 'preparing')}
                    >
                      Start preparing
                    </button>
                  ) : null}
                  {order.status === 'preparing' ? (
                    <button
                      className="flex-1 rounded-xl bg-emerald-800 px-3 py-2 text-sm font-semibold text-white"
                      onClick={() => transition(order.id, 'ready')}
                    >
                      Ready for pickup
                    </button>
                  ) : null}
                </div>
              }
            />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState title="No live orders" description="New orders will appear here instantly." />
        </div>
      )}
    </main>
  )
}
