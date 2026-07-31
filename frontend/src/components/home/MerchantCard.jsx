import { Heart, Star, Store } from 'lucide-react'
import imageUrl from '../../utils/imageUrl'

export default function MerchantCard({
  merchant,
  onClick,
  isFavorite = false,
  onToggleFavorite,
}) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.()
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="cursor-pointer overflow-hidden rounded-[24px] border bg-white outline-none transition-[transform,box-shadow,border-color] duration-200 ease-out active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[var(--mzaya-primary)] focus-visible:ring-offset-2"
      style={{
        borderColor: 'var(--mzaya-border)',
        boxShadow: '0 10px 30px rgba(18, 23, 20, 0.055)',
      }}
    >
      <div className="relative h-44 overflow-hidden" style={{ background: 'var(--mzaya-surface-muted)' }}>
        {merchant.cover_url ? (
          <img src={imageUrl(merchant.cover_url, 800)} alt={merchant.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ color: 'var(--mzaya-neutral-400)' }}>
            <Store aria-hidden="true" size={46} strokeWidth={1.35} />
          </div>
        )}

        {!merchant.is_open && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
            <span className="rounded-full border bg-white px-3 py-1.5 text-[11px] font-semibold" style={{ borderColor: 'var(--mzaya-border)', color: 'var(--mzaya-text-secondary)' }}>
              Currently closed
            </span>
          </div>
        )}

        <button
          type="button"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={(event) => {
            event.stopPropagation()
            onToggleFavorite?.()
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border bg-white/95 outline-none backdrop-blur transition-transform active:scale-90 focus-visible:ring-2 focus-visible:ring-[var(--mzaya-primary)] focus-visible:ring-offset-2"
          style={{
            borderColor: 'rgba(226, 232, 228, 0.92)',
            color: isFavorite ? 'var(--mzaya-primary)' : 'var(--mzaya-text-secondary)',
          }}
        >
          <Heart aria-hidden="true" size={17} strokeWidth={1.8} fill={isFavorite ? 'var(--mzaya-primary)' : 'none'} />
        </button>

        <div className="absolute bottom-3 left-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-[14px] border bg-white shadow-sm" style={{ borderColor: 'var(--mzaya-border)' }}>
          {merchant.logo_url ? (
            <img src={imageUrl(merchant.logo_url, 120)} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[17px] font-semibold" style={{ color: 'var(--mzaya-green-800)' }}>
              {merchant.name?.charAt(0)}
            </span>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 pt-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate text-[16px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--mzaya-text-primary)' }}>
            {merchant.name}
          </h3>
          {merchant.is_open && (
            <span className="flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold" style={{ background: 'var(--mzaya-success-soft)', color: 'var(--mzaya-success)' }}>
              Open
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2 text-[12px]" style={{ color: 'var(--mzaya-text-secondary)' }}>
          <span className="inline-flex items-center gap-1 font-medium">
            <Star aria-hidden="true" size={12} strokeWidth={1.8} fill="var(--mzaya-gold-500)" color="var(--mzaya-gold-500)" />
            {Number(merchant.rating || 0).toFixed(1)}
          </span>
          <span aria-hidden="true" style={{ color: 'var(--mzaya-neutral-300)' }}>•</span>
          <span>15–25 min</span>
          <span aria-hidden="true" style={{ color: 'var(--mzaya-neutral-300)' }}>•</span>
          <span>US$2–4 delivery</span>
        </div>

        {merchant.branch_count > 1 && (
          <p className="mt-2 text-[12px]" style={{ color: 'var(--mzaya-text-muted)' }}>
            {merchant.branch_count} branches available nearby
          </p>
        )}
      </div>
    </article>
  )
}
