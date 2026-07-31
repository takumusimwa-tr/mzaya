/**
 * Compatibility adapter.
 *
 * New work should import AppInput from `components/common`.
 */
import AppInput from '../common/AppInput'

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = '',
  ...props
}) {
  return (
    <AppInput
      label={label}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      error={error}
      required={required}
      className={className}
      {...props}
    />
  )
}
