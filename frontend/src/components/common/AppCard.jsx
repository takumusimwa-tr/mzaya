/**
 * MZAYA canonical surface card.
 */
import { classNames } from './classNames'

const variants = {
  default: 'border border-[var(--mzaya-border)] bg-[var(--mzaya-surface)]',
  elevated:
    'border border-black/[0.04] bg-[var(--mzaya-surface)] shadow-[var(--mzaya-shadow-md)]',
  subtle: 'border border-transparent bg-[var(--mzaya-surface-subtle)]',
  interactive:
    'border border-[var(--mzaya-border)] bg-[var(--mzaya-surface)] hover:border-[var(--mzaya-green-300)] hover:shadow-[var(--mzaya-shadow-md)]',
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export default function AppCard({
  as: Component = 'section',
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  ...props
}) {
  return (
    <Component
      className={classNames(
        'rounded-2xl transition-[border-color,box-shadow] duration-[var(--mzaya-motion-base)]',
        variants[variant] || variants.default,
        paddings[padding] || paddings.md,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
