/**
 * MZAYA canonical button.
 *
 * Integration:
 * - Use for actions, form submission and link-like controls.
 * - Existing `components/ui/Button.jsx` delegates to this component.
 *
 * Preserved behavior:
 * - Supports primary, secondary, outline, danger and ghost variants.
 * - Supports sm, md and lg sizes.
 * - Disables interaction while loading.
 */

import { LoaderCircle } from 'lucide-react'
import { classNames } from './classNames'

const variants = {
  primary:
    'bg-[var(--mzaya-green-600)] text-white shadow-[var(--mzaya-shadow-sm)] hover:bg-[var(--mzaya-green-700)] focus-visible:shadow-[var(--mzaya-focus-ring)]',
  secondary:
    'bg-[var(--mzaya-surface-subtle)] text-[var(--mzaya-text-primary)] hover:bg-gray-200 focus-visible:shadow-[var(--mzaya-focus-ring)]',
  outline:
    'border border-[var(--mzaya-green-600)] bg-white text-[var(--mzaya-green-700)] hover:bg-[var(--mzaya-green-50)] focus-visible:shadow-[var(--mzaya-focus-ring)]',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:shadow-[0_0_0_4px_rgba(220,38,38,.16)]',
  ghost:
    'bg-transparent text-[var(--mzaya-text-secondary)] hover:bg-[var(--mzaya-surface-subtle)] hover:text-[var(--mzaya-text-primary)] focus-visible:shadow-[var(--mzaya-focus-ring)]',
}

const sizes = {
  sm: 'min-h-9 px-3 py-2 text-sm',
  md: 'min-h-11 px-4 py-2.5 text-sm',
  lg: 'min-h-13 px-6 py-3.5 text-base',
}

export default function AppButton({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  className = '',
  ...buttonProps
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classNames(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
        'transition-[background-color,color,border-color,box-shadow,transform]',
        'duration-[var(--mzaya-motion-fast)] ease-[var(--mzaya-ease-standard)]',
        'focus-visible:outline-none active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        fullWidth && 'w-full',
        className
      )}
      {...buttonProps}
    >
      {loading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : LeadingIcon ? (
        <LeadingIcon className="h-4 w-4" aria-hidden="true" />
      ) : null}

      <span>{children}</span>

      {!loading && TrailingIcon ? (
        <TrailingIcon className="h-4 w-4" aria-hidden="true" />
      ) : null}
    </button>
  )
}
