/**
 * MZAYA canonical semantic badge.
 */
import { classNames } from './classNames'

const tones = {
  neutral: 'bg-gray-100 text-gray-700',
  info: 'bg-blue-50 text-blue-700',
  warning: 'bg-amber-50 text-amber-700',
  success: 'bg-[var(--mzaya-green-50)] text-[var(--mzaya-green-800)]',
  danger: 'bg-red-50 text-red-700',
  dark: 'bg-[var(--mzaya-navy-950)] text-white',
}

const statusTone = {
  pending: 'warning',
  scheduled: 'warning',
  accepted: 'info',
  picked_up: 'success',
  en_route: 'success',
  delivered: 'dark',
  active: 'success',
  approved: 'success',
  paused: 'warning',
  inactive: 'neutral',
  cancelled: 'danger',
  failed: 'danger',
}

export default function StatusBadge({
  children,
  status,
  tone,
  dot = false,
  className = '',
}) {
  const resolvedTone = tone || statusTone[status] || 'neutral'

  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        tones[resolvedTone] || tones.neutral,
        className
      )}
    >
      {dot ? (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current opacity-80"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </span>
  )
}
