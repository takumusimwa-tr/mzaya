import { Minus, Plus } from 'lucide-react'

export default function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  min = 1,
  max,
  disabled = false,
  size = 'md',
  className = '',
}) {
  const isSmall = size === 'sm'
  const controlSize = isSmall ? 'h-8 w-8' : 'h-10 w-10'
  const iconSize = isSmall ? 15 : 17
  const decreaseDisabled = disabled || value <= min
  const increaseDisabled = disabled || (max != null && value >= max)

  return (
    <div
      className={[
        'inline-flex items-center overflow-hidden rounded-full border bg-white',
        className,
      ].join(' ')}
      style={{ borderColor: 'var(--mzaya-border)' }}
      aria-label="Quantity controls"
    >
      <button
        type="button"
        onClick={onDecrease}
        disabled={decreaseDisabled}
        aria-label="Decrease quantity"
        className={`${controlSize} flex items-center justify-center outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-35 focus-visible:[box-shadow:var(--mzaya-focus-ring)]`}
        style={{ color: 'var(--mzaya-text-secondary)' }}
      >
        <Minus aria-hidden="true" size={iconSize} strokeWidth={2} />
      </button>

      <span
        className={`${isSmall ? 'min-w-7 text-[12px]' : 'min-w-9 text-[13px]'} text-center font-semibold`}
        style={{ color: 'var(--mzaya-text-primary)' }}
        aria-live="polite"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={increaseDisabled}
        aria-label="Increase quantity"
        className={`${controlSize} flex items-center justify-center outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-35 focus-visible:[box-shadow:var(--mzaya-focus-ring)]`}
        style={{ color: 'var(--mzaya-primary)' }}
      >
        <Plus aria-hidden="true" size={iconSize} strokeWidth={2} />
      </button>
    </div>
  )
}
