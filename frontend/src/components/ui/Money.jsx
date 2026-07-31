const ZIG_RATE = Number(import.meta.env.VITE_ZIG_RATE) || 0

const sizeClasses = {
  sm: 'text-[12px]',
  base: 'text-[14px]',
  lg: 'text-[18px]',
  xl: 'text-[24px]',
}

// eslint-disable-next-line react-refresh/only-export-components
export function formatUsd(amount, options = {}) {
  const { showCode = false } = options
  const value = Number(amount || 0)

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: showCode ? 'code' : 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace('$', 'US$')
}

// eslint-disable-next-line react-refresh/only-export-components
export function formatZig(amount) {
  return `ZiG ${Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default function Money({
  usd,
  zig = false,
  size = 'base',
  className = '',
  zigClassName = '',
  muted = false,
}) {
  const zigValue =
    zig === true
      ? ZIG_RATE
        ? Number(usd || 0) * ZIG_RATE
        : null
      : typeof zig === 'number' && zig >= 0
        ? zig
        : null

  const sizeClass = sizeClasses[size] ?? sizeClasses.base

  return (
    <span className={`inline-flex flex-col leading-tight ${className}`}>
      <span
        className={`${sizeClass} font-semibold tracking-[-0.01em]`}
        style={{
          color: muted
            ? 'var(--mzaya-text-secondary)'
            : 'var(--mzaya-text-primary)',
        }}
      >
        {formatUsd(usd)}
      </span>

      {zigValue != null && (
        <span
          className={`mt-1 text-[11px] font-medium ${zigClassName}`}
          style={{ color: 'var(--mzaya-text-muted)' }}
        >
          ≈ {formatZig(zigValue)}
        </span>
      )}
    </span>
  )
}
