/**
 * MZAYA canonical select control.
 */
import { ChevronDown } from 'lucide-react'
import FormField from './FormField'
import { classNames } from './classNames'

export default function AppSelect({
  id,
  name,
  label,
  error,
  hint,
  required = false,
  children,
  className = '',
  selectClassName = '',
  ...selectProps
}) {
  const controlId = id || name

  return (
    <FormField
      id={controlId}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={className}
    >
      <div className="relative">
        <select
          id={controlId}
          name={name}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${controlId}-error` : hint ? `${controlId}-hint` : undefined
          }
          className={classNames(
            'min-h-12 w-full appearance-none rounded-xl border bg-white px-4 py-3 pr-10 text-sm',
            'text-[var(--mzaya-text-primary)] outline-none',
            'transition-[border-color,box-shadow]',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
            error
              ? 'border-red-400 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(220,38,38,.12)]'
              : 'border-[var(--mzaya-border)] focus:border-[var(--mzaya-green-600)] focus:shadow-[var(--mzaya-focus-ring)]',
            selectClassName
          )}
          {...selectProps}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mzaya-text-secondary)]"
          aria-hidden="true"
        />
      </div>
    </FormField>
  )
}
