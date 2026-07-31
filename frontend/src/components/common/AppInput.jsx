/**
 * MZAYA canonical text input.
 */
import FormField from './FormField'
import { classNames } from './classNames'

export default function AppInput({
  id,
  name,
  label,
  type = 'text',
  error,
  hint,
  required = false,
  leadingIcon: LeadingIcon,
  trailingElement,
  className = '',
  inputClassName = '',
  ...inputProps
}) {
  const controlId = id || name
  const describedBy = error
    ? `${controlId}-error`
    : hint
      ? `${controlId}-hint`
      : undefined

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
        {LeadingIcon ? (
          <LeadingIcon
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mzaya-text-secondary)]"
            aria-hidden="true"
          />
        ) : null}

        <input
          id={controlId}
          name={name}
          type={type}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={classNames(
            'min-h-12 w-full rounded-xl border bg-white px-4 py-3 text-sm',
            'text-[var(--mzaya-text-primary)] placeholder:text-gray-400',
            'outline-none transition-[border-color,box-shadow]',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
            error
              ? 'border-red-400 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(220,38,38,.12)]'
              : 'border-[var(--mzaya-border)] focus:border-[var(--mzaya-green-600)] focus:shadow-[var(--mzaya-focus-ring)]',
            LeadingIcon && 'pl-10',
            trailingElement && 'pr-12',
            inputClassName
          )}
          {...inputProps}
        />

        {trailingElement ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {trailingElement}
          </div>
        ) : null}
      </div>
    </FormField>
  )
}
