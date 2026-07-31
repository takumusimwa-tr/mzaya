import { Search, X } from 'lucide-react'
import { useId, useState } from 'react'

const COLORS = {
  green: '#136B57',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF3F0',
  text: '#121714',
  textMuted: '#7C8982',
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search products or services',
  ariaLabel,
  onSubmit,
  onClear,
  autoFocus = false,
  disabled = false,
  className = '',
}) {
  const inputId = useId()
  const [focused, setFocused] = useState(false)
  const hasValue = Boolean(value)

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit?.(value)
  }

  const handleClear = () => {
    onChange?.('')
    onClear?.()
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={className}
    >
      <label htmlFor={inputId} className="sr-only">
        {ariaLabel || placeholder}
      </label>

      <div
        className="flex h-14 items-center gap-3 rounded-2xl border px-4 transition-[background-color,border-color,box-shadow] duration-200 ease-out"
        style={{
          background: focused ? COLORS.surface : COLORS.surfaceMuted,
          borderColor: focused ? COLORS.green : 'transparent',
          boxShadow: focused ? '0 0 0 3px rgba(19, 107, 87, 0.10)' : 'none',
          opacity: disabled ? 0.55 : 1,
        }}
      >
        <Search
          aria-hidden="true"
          size={19}
          strokeWidth={1.9}
          style={{ color: focused ? COLORS.green : COLORS.textMuted }}
          className="shrink-0 transition-colors duration-200"
        />

        <input
          id={inputId}
          type="search"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          enterKeyHint="search"
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent text-[15px] leading-6 outline-none placeholder:text-[#7C8982] disabled:cursor-not-allowed"
          style={{ color: COLORS.text }}
        />

        {hasValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#7C8982] outline-none transition-colors duration-150 hover:bg-black/[0.045] hover:text-[#526159] focus-visible:ring-2 focus-visible:ring-[#136B57] focus-visible:ring-offset-2 active:bg-black/[0.07]"
          >
            <X aria-hidden="true" size={17} strokeWidth={2} />
          </button>
        )}
      </div>
    </form>
  )
}
