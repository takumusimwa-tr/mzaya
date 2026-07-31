import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AppHeader({
  title,
  subtitle,
  backTo,
  showBack = true,
  action,
  cartCount,
  className = '',
}) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (backTo) {
      navigate(backTo)
      return
    }

    navigate(-1)
  }

  return (
    <header
      className={[
        'sticky top-0 z-30 border-b bg-white/95 backdrop-blur',
        className,
      ].join(' ')}
      style={{ borderColor: 'var(--mzaya-border)' }}
    >
      <div className="mx-auto flex min-h-16 w-full max-w-3xl items-center gap-3 px-4">
        {showBack ? (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border bg-white outline-none transition-transform active:scale-95 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{
              borderColor: 'var(--mzaya-border)',
              color: 'var(--mzaya-text-primary)',
            }}
          >
            <ArrowLeft aria-hidden="true" size={20} strokeWidth={1.9} />
          </button>
        ) : (
          <div className="h-11 w-1" aria-hidden="true" />
        )}

        <div className="min-w-0 flex-1 py-2">
          <h1
            className="truncate text-[18px] font-semibold tracking-[-0.02em]"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className="mt-0.5 truncate text-[12px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {action ?? (
          cartCount != null && (
            <div
              className="relative flex h-11 w-11 items-center justify-center rounded-full border bg-white"
              style={{
                borderColor: 'var(--mzaya-border)',
                color: 'var(--mzaya-text-primary)',
              }}
              aria-label={`${cartCount} items in cart`}
            >
              <ShoppingBag aria-hidden="true" size={20} strokeWidth={1.9} />
              {cartCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold"
                  style={{
                    background: 'var(--mzaya-primary)',
                    color: 'var(--mzaya-text-inverse)',
                  }}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
          )
        )}
      </div>
    </header>
  )
}
