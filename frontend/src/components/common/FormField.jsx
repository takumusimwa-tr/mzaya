/**
 * Shared label, hint and error shell for MZAYA form controls.
 */
import { classNames } from './classNames'

export default function FormField({
  id,
  label,
  required = false,
  hint,
  error,
  className = '',
  children,
}) {
  return (
    <div className={classNames('flex flex-col gap-1.5', className)}>
      {label ? (
        <label
          htmlFor={id}
          className="text-sm font-semibold text-[var(--mzaya-text-primary)]"
        >
          {label}
          {required ? (
            <span className="ml-1 text-red-600" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      {children}

      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-[var(--mzaya-text-secondary)]">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
