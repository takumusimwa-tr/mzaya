const variants = {
  pending:   'bg-yellow-100 text-yellow-800',
  accepted:  'bg-blue-100 text-blue-800',
  picked_up: 'bg-purple-100 text-purple-800',
  en_route:  'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  failed:    'bg-gray-100 text-gray-600',
  food:      'bg-orange-100 text-orange-800',
  grocery:   'bg-green-100 text-green-800',
  materials: 'bg-yellow-100 text-yellow-800',
  errand:    'bg-blue-100 text-blue-800',
}

export default function Badge({ label, type }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${variants[type] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  )
}
