/**
 * Compatibility adapter.
 *
 * New work should import AppButton from `components/common`.
 * Existing screens can continue importing this file without visual or API breakage.
 */
import AppButton from '../common/AppButton'

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <AppButton
      type={type}
      onClick={onClick}
      variant={variant}
      size={size}
      loading={loading}
      disabled={disabled}
      fullWidth={size === 'lg'}
      className={className}
      {...props}
    >
      {children}
    </AppButton>
  )
}
