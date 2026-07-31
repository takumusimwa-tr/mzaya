import OrderStatusPill from './OrderStatusPill'

export default function LiveOrderCard({ order, actions }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Order
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">
            #{String(order.id).slice(0, 8)}
          </h3>
        </div>
        <OrderStatusPill status={order.status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-slate-500">Total</dt>
          <dd className="font-semibold text-slate-950">
            {order.currency || 'USD'} {Number(order.total_amount || order.total || 0).toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Placed</dt>
          <dd className="font-semibold text-slate-950">
            {new Date(order.created_at || order.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </dd>
        </div>
      </dl>

      {actions ? <div className="mt-5">{actions}</div> : null}
    </article>
  )
}
