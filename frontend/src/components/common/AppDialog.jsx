/**
 * MZAYA accessible modal dialog.
 *
 * Escape closes the dialog. Background scrolling is locked while open.
 */
import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import AppButton from './AppButton'
import { classNames } from './classNames'

const widths = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export default function AppDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'md',
  closeLabel = 'Close dialog',
  className = '',
}) {
  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(7,27,51,.48)] p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={classNames(
          'max-h-[90vh] w-full overflow-y-auto bg-white shadow-[var(--mzaya-shadow-lg)] outline-none',
          'rounded-t-3xl sm:rounded-3xl',
          widths[width] || widths.md,
          className
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--mzaya-border)] px-5 py-5 sm:px-6">
          <div>
            <h2
              id={titleId}
              className="text-lg font-bold text-[var(--mzaya-text-primary)]"
            >
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                className="mt-1 text-sm text-[var(--mzaya-text-secondary)]"
              >
                {description}
              </p>
            ) : null}
          </div>

          <AppButton
            variant="ghost"
            size="sm"
            aria-label={closeLabel}
            onClick={onClose}
            className="-mr-2 -mt-1 !px-2.5"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </AppButton>
        </header>

        <div className="px-5 py-5 sm:px-6">{children}</div>

        {footer ? (
          <footer className="border-t border-[var(--mzaya-border)] px-5 py-4 sm:px-6">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  )
}
