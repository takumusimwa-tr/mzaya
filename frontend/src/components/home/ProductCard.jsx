import { PackageOpen } from 'lucide-react'
import imageUrl from '../../utils/imageUrl'

function ProductImage({ product, sizeClass, iconSize }) {
  return (
    <div className={`flex flex-shrink-0 items-center justify-center overflow-hidden ${sizeClass}`} style={{ background: 'var(--mzaya-surface-muted)' }}>
      {product.image_url ? (
        <img src={imageUrl(product.image_url, 300)} alt={product.name} className="h-full w-full object-cover" />
      ) : (
        <PackageOpen aria-hidden="true" size={iconSize} strokeWidth={1.4} style={{ color: 'var(--mzaya-neutral-400)' }} />
      )}
    </div>
  )
}

export function ProductTile({ product, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[154px] flex-shrink-0 overflow-hidden rounded-[20px] border bg-white text-left outline-none transition-transform active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[var(--mzaya-primary)] focus-visible:ring-offset-2"
      style={{ borderColor: 'var(--mzaya-border)', boxShadow: '0 8px 24px rgba(18, 23, 20, 0.05)' }}
    >
      <ProductImage product={product} sizeClass="h-28 w-full" iconSize={28} />
      <div className="p-3">
        <p className="truncate text-[13px] font-semibold" style={{ color: 'var(--mzaya-text-primary)' }}>{product.name}</p>
        <p className="mt-0.5 truncate text-[11px]" style={{ color: 'var(--mzaya-text-muted)' }}>{product.brand_name}</p>
        <div className="mt-2 flex items-end justify-between gap-2">
          <span className="text-[13px] font-semibold" style={{ color: 'var(--mzaya-text-primary)' }}>
            US${Number(product.price_usd).toFixed(2)}
          </span>
          {product.distance_km != null && (
            <span className="text-[10px]" style={{ color: 'var(--mzaya-text-muted)' }}>{product.distance_km} km</span>
          )}
        </div>
      </div>
    </button>
  )
}

export function ProductRow({ product, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[20px] border bg-white p-3 text-left outline-none transition-transform active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[var(--mzaya-primary)] focus-visible:ring-offset-2"
      style={{ borderColor: 'var(--mzaya-border)', boxShadow: '0 8px 24px rgba(18, 23, 20, 0.045)' }}
    >
      <ProductImage product={product} sizeClass="h-20 w-20 rounded-[16px]" iconSize={24} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold" style={{ color: 'var(--mzaya-text-primary)' }}>{product.name}</p>
        {product.description && (
          <p className="mt-0.5 truncate text-[12px]" style={{ color: 'var(--mzaya-text-muted)' }}>{product.description}</p>
        )}
        <div className="mt-1.5 flex items-center gap-2 text-[11px]" style={{ color: 'var(--mzaya-text-secondary)' }}>
          <span className="font-medium">{product.brand_name}</span>
          {product.distance_km != null && (
            <>
              <span aria-hidden="true" style={{ color: 'var(--mzaya-neutral-300)' }}>•</span>
              <span>{product.distance_km} km</span>
            </>
          )}
        </div>
      </div>
      <p className="flex-shrink-0 text-[14px] font-semibold" style={{ color: 'var(--mzaya-text-primary)' }}>
        US${Number(product.price_usd).toFixed(2)}
      </p>
    </button>
  )
}
