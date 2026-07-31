const STATUS_LABELS = {
  placed: 'Order placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for pickup',
  rider_assigned: 'Mzaya assigned',
  accepted: 'Mzaya accepted',
  picked_up: 'Picked up',
  en_route: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default function OrderStatusPill({ status }) {
  const normalized = String(status || '').toLowerCase()
  const label = STATUS_LABELS[normalized] || normalized.replaceAll('_', ' ')

  return (
    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
      {label}
    </span>
  )
}
