// Status + category badges.
//
// Two different jobs here, and they follow different rules:
//
// ORDER STATUS is a progression (pending → accepted → picked_up → en_route →
// delivered). Distinct hues genuinely help someone scan a list and see where an
// order is, so we keep a spectrum — but a MUTED one that sits beside the brand
// green rather than fighting it. Cancelled/failed stay red/grey: those are
// semantic warnings, not branding.
//
// CATEGORY is not a progression — the old palette (food=orange, errand=blue) was
// arbitrary decoration that clashed with the brand. Categories now use neutral
// slate with a green accent, and the icon carries the identity instead.

const variants = {
  // ── Order lifecycle (muted progression) ──
  pending:   'bg-amber-50 text-amber-700',
  scheduled: 'bg-amber-50 text-amber-700',
  accepted:  'bg-teal-50 text-teal-700',
  picked_up: 'bg-emerald-50 text-emerald-700',
  en_route:  'bg-green-50 text-green-700',
  delivered: 'text-white',            // filled brand green — the terminal success
  cancelled: 'bg-red-50 text-red-600',
  failed:    'bg-gray-100 text-gray-500',

  // ── Categories (neutral; the icon carries identity) ──
  food:      'bg-gray-100 text-gray-700',
  grocery:   'bg-gray-100 text-gray-700',
  materials: 'bg-gray-100 text-gray-700',
  errand:    'bg-gray-100 text-gray-700',
}

export default function Badge({ label, type }) {
  const isDelivered = type === 'delivered'
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${variants[type] || 'bg-gray-100 text-gray-600'}`}
      style={isDelivered ? { background: '#00A651' } : undefined}
    >
      {label}
    </span>
  )
}
