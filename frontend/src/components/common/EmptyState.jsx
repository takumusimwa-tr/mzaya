/**
 * MZAYA canonical empty state.
 */
import AppCard from './AppCard'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}) {
  return (
    <AppCard
      variant="subtle"
      className={`flex flex-col items-center text-center ${compact ? 'py-8' : 'py-12'}`}
    >
      {Icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--mzaya-green-50)] text-[var(--mzaya-green-700)]">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      ) : null}
      <h3 className="text-base font-bold text-[var(--mzaya-text-primary)]">
        {title}
      </h3>
      {description ? (
        <p className="mt-1.5 max-w-md text-sm leading-6 text-[var(--mzaya-text-secondary)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </AppCard>
  )
}
