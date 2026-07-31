const STEPS = [
  'placed',
  'confirmed',
  'preparing',
  'ready',
  'rider_assigned',
  'picked_up',
  'en_route',
  'delivered',
]

const LABELS = {
  placed: 'Order placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing your order',
  ready: 'Ready for pickup',
  rider_assigned: 'Mzaya assigned',
  picked_up: 'Picked up',
  en_route: 'On the way',
  delivered: 'Delivered',
}

export default function OrderTimeline({ status, timeline = [] }) {
  const currentIndex = STEPS.indexOf(status)
  const occurredAt = new Map(
    timeline.map((event) => [
      event.to_status || event.status,
      event.created_at || event.createdAt,
    ])
  )

  return (
    <ol className="space-y-4">
      {STEPS.map((step, index) => {
        const complete = index <= currentIndex
        const timestamp = occurredAt.get(step)

        return (
          <li key={step} className="flex gap-3">
            <span
              className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                complete ? 'bg-emerald-700' : 'bg-slate-200'
              }`}
              aria-hidden="true"
            />
            <div>
              <p className={`text-sm font-semibold ${
                complete ? 'text-slate-950' : 'text-slate-400'
              }`}>
                {LABELS[step]}
              </p>
              {timestamp ? (
                <time className="text-xs text-slate-500">
                  {new Date(timestamp).toLocaleString()}
                </time>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
