/**
 * Small operational status indicator for live order screens.
 */
export default function RealtimeStatus({ connected, error }) {
  const label = error
    ? 'Live updates unavailable'
    : connected
      ? 'Live'
      : 'Connecting'

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
        connected
          ? 'bg-emerald-50 text-emerald-700'
          : error
            ? 'bg-red-50 text-red-700'
            : 'bg-amber-50 text-amber-700'
      }`}
      title={error?.message || label}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          connected ? 'bg-current' : 'bg-current opacity-70'
        }`}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
