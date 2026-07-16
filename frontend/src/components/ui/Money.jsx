// Currency display for Zimbabwe.
//
// Two things this fixes:
//
// 1. A bare "$" is ambiguous in Zimbabwe — it reads as either USD or the old
//    ZWL habit. The regional convention is to write US$ explicitly. So we do.
//
// 2. Zimbabweans price-check in BOTH currencies while deciding, not at the
//    payment screen. So ZiG belongs next to the price wherever people choose,
//    not tucked away at checkout.
//
// Defining it once means changing how money looks across the app is a one-file
// edit — and the ZiG rate logic never gets copy-pasted wrong.

// Rate is supplied by the backend on orders (total_zig). For catalogue prices we
// convert with the current rate exposed at build/run time.
const ZIG_RATE = Number(import.meta.env.VITE_ZIG_RATE) || 0

// eslint-disable-next-line react-refresh/only-export-components
export function formatUsd(amount) {
  return `US$${Number(amount || 0).toFixed(2)}`
}

// eslint-disable-next-line react-refresh/only-export-components
export function formatZig(amount) {
  return `ZiG ${Number(amount || 0).toFixed(2)}`
}

/**
 * <Money usd={12.5} />                  → US$12.50
 * <Money usd={12.5} zig />              → US$12.50  ≈ ZiG 337.50   (converted)
 * <Money usd={12.5} zig={order.total_zig} />  → uses the exact stored ZiG
 * <Money usd={12.5} size="lg" />
 */
export default function Money({
  usd,
  zig = false,
  size = 'base',
  className = '',
  zigClassName = '',
}) {
  // `zig` may be `true` (convert), a number (use it), or false (hide).
  const zigValue = zig === true
    ? (ZIG_RATE ? Number(usd || 0) * ZIG_RATE : null)
    : (typeof zig === 'number' && zig > 0 ? zig : null)

  const sizes = {
    sm:   'text-xs',
    base: 'text-sm',
    lg:   'text-lg',
    xl:   'text-2xl',
  }

  return (
    <span className={`inline-flex flex-col leading-tight ${className}`}>
      <span className={`${sizes[size] || sizes.base} font-bold`}>{formatUsd(usd)}</span>
      {zigValue != null && (
        <span className={`text-[11px] font-medium text-gray-400 ${zigClassName}`}>
          ≈ {formatZig(zigValue)}
        </span>
      )}
    </span>
  )
}
