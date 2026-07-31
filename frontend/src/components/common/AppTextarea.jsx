/**
 * MZAYA canonical multiline input.
 */
import FormField from './FormField'
import { classNames } from './classNames'

export default function AppTextarea({
  id,
  name,
  label,
  error,
  hint,
  required = false,
  rows = 4,
  className = '',
  textareaClassName = '',
  ...textareaProps
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
      <textarea
        id={controlId}
        name={name}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${controlId}-error` : hint ? `${controlId}-hint` : undefined
        }
        className={classNames(
          'w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm',
          'text-[var(--mzaya-text-primary)] placeholder:text-gray-400',
          'outline-none transition-[border-color,box-shadow]',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
          error
            ? 'border-red-400 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(220,38,38,.12)]'
            : 'border-[var(--mzaya-border)] focus:border-[var(--mzaya-green-600)] focus:shadow-[var(--mzaya-focus-ring)]',
          textareaClassName
        )}
        {...textareaProps}
      />
    </FormField>
  )
}
