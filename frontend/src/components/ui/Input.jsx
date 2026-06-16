export default function Input({
  label, name, type = 'text', value, onChange,
  placeholder, error, required = false, className = '',
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all
          ${error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
          } bg-white`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
