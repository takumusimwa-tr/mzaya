/**
 * MZAYA canonical loading state.
 */
import { LoaderCircle } from 'lucide-react'

export default function LoadingState({
  label = 'Loading',
  fullScreen = false,
}) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? 'min-h-screen' : 'min-h-52'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 text-[var(--mzaya-text-secondary)]">
        <LoaderCircle
          className="h-7 w-7 animate-spin text-[var(--mzaya-green-600)]"
          aria-hidden="true"
        />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  )
}
