/**
 * MZAYA canonical page heading and action area.
 */
import { classNames } from './classNames'

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  backAction,
  className = '',
}) {
  return (
    <header
      className={classNames(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        {backAction ? <div className="mb-3">{backAction}</div> : null}
        {eyebrow ? (
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--mzaya-green-700)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-extrabold tracking-[-0.025em] text-[var(--mzaya-text-primary)] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--mzaya-text-secondary)] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  )
}
