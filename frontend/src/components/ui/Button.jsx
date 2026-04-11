export default function Button({
  children, onClick, type = 'button',
  variant = 'primary', size = 'md',
  loading = false, disabled = false,
  className = '',
}) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:  'bg-green-600 text-white hover:bg-green-700 shadow-sm',
    secondary:'bg-gray-100 text-gray-800 hover:bg-gray-200',
    outline:  'border-2 border-green-600 text-green-600 hover:bg-green-50',
    danger:   'bg-red-500 text-white hover:bg-red-600',
    ghost:    'text-gray-600 hover:bg-gray-100',
  }

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-4 text-base w-full',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      ) : null}
      {children}
    </button>
  )
}
