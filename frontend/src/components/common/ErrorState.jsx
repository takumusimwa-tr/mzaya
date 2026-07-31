/**
 * MZAYA canonical recoverable error state.
 */
import { AlertCircle } from 'lucide-react'
import AppButton from './AppButton'
import AppCard from './AppCard'

export default function ErrorState({
  title = 'Something went wrong',
  description = 'We could not complete this request. Please try again.',
  onRetry,
  retryLabel = 'Try again',
}) {
  return (
    <AppCard
      variant="default"
      className="flex flex-col items-center border-red-100 py-10 text-center"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-[var(--mzaya-text-primary)]">
        {title}
      </h3>
      <p className="mt-1.5 max-w-md text-sm leading-6 text-[var(--mzaya-text-secondary)]">
        {description}
      </p>
      {onRetry ? (
        <AppButton variant="outline" className="mt-5" onClick={onRetry}>
          {retryLabel}
        </AppButton>
      ) : null}
    </AppCard>
  )
}
