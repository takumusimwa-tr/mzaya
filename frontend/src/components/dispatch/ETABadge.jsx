export default function ETABadge({ minutes, prefix = 'ETA' }) {
  const value = Number(minutes)
  const label = Number.isFinite(value)
    ? `${Math.max(1, Math.ceil(value))} min`
    : 'Calculating'

  return (
    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      {prefix}: {label}
    </span>
  )
}
