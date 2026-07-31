export default function RiderLocationPanel({ location, riderName = 'Your Mzaya' }) {
  if (!location) {
    return (
      <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
        Live location will appear after pickup.
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-slate-950 p-5 text-white">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
        Live location
      </p>
      <h3 className="mt-1 text-lg font-semibold">{riderName} is moving</h3>
      <p className="mt-2 text-sm text-slate-300">
        Last update {new Date(location.recordedAt).toLocaleTimeString()}
      </p>
      <p className="mt-3 text-xs text-slate-400">
        {Number(location.lat).toFixed(5)}, {Number(location.lng).toFixed(5)}
      </p>
    </div>
  )
}
