import { Heart, Star } from 'lucide-react'
import Icon from '../ui/Icon'
import Money from '../ui/Money'
import imageUrl from '../../utils/imageUrl'

const COLORS = { green: '#086C55', deep: '#052A25', pale: '#E7F3EE', muted: '#64736C' }

export function DiscoveryProductCard({ product, category, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="group min-w-0 overflow-hidden rounded-[20px] border border-[#EDF1EE] bg-white text-left transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#086C55]">
      <span className="relative flex aspect-[1.12] items-center justify-center overflow-hidden bg-[#F4F6F5]">
        {product.image_url ? (
          <img src={imageUrl(product.image_url, 480)} alt="" loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
        ) : <Icon name={category} size={40} className="text-[#A3B4AA]" />}
      </span>
      <span className="block px-3 pb-3 pt-2.5">
        <span className="block truncate text-[11px] font-medium" style={{ color: COLORS.muted }}>{product.brand_name}</span>
        <span className="mt-1 block min-h-[38px] line-clamp-2 text-[14px] font-bold leading-snug text-[#17231D]">{product.name}</span>
        <span className="mt-2 block text-[15px] font-extrabold" style={{ color: COLORS.deep }}><Money usd={product.price_usd} /></span>
      </span>
    </button>
  )
}

export function DiscoveryVendorCard({ brand, onClick, favorite, onFavorite }) {
  const rating = Number(brand.rating) || 0
  const cover = brand.cover_url || brand.banner_url || brand.image_url
  return (
    <li className="min-w-0">
      <article className="overflow-hidden rounded-[22px] border border-[#EAF0EC] bg-white">
        <button type="button" onClick={onClick} className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#086C55]">
          <span className="relative flex h-36 items-center justify-center overflow-hidden bg-[#E7F3EE]">
            {cover ? <img src={imageUrl(cover, 640)} alt="" loading="lazy" className="h-full w-full object-cover" />
              : brand.logo_url ? <img src={imageUrl(brand.logo_url, 240)} alt="" loading="lazy" className="h-20 w-20 rounded-full object-cover ring-4 ring-white/80" />
              : <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 text-[30px] font-extrabold" style={{ color: COLORS.deep }}>{brand.name?.trim()?.charAt(0)?.toUpperCase() || 'M'}</span>}
            <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold" style={{ color: brand.is_open ? COLORS.green : COLORS.muted }}>
              {brand.is_open ? 'Open now' : 'Closed'}
            </span>
          </span>
          <span className="block px-3 pb-3 pt-3">
            <span className="block truncate text-[15px] font-extrabold tracking-tight text-[#17231D]">{brand.name}</span>
            <span className="mt-1 flex items-center gap-1 text-[12px]" style={{ color: COLORS.muted }}>
              {rating > 0 ? <><Star size={13} fill="#086C55" stroke="#086C55" /><span className="font-bold text-[#17231D]">{rating.toFixed(1)}</span></> : <span>New on Mzaya</span>}
              {brand.branch_count > 1 && <span> · {brand.branch_count} branches</span>}
            </span>
          </span>
        </button>
        {onFavorite && <div className="px-3 pb-3">
          <button type="button" onClick={onFavorite} aria-pressed={favorite}
            aria-label={favorite ? `Remove ${brand.name} from favourites` : `Save ${brand.name}`}
            className="flex h-9 items-center gap-2 rounded-full bg-[#F4F6F5] px-3 text-[12px] font-semibold text-[#415A4E]">
            <Heart size={15} fill={favorite ? COLORS.green : 'none'} stroke={COLORS.green}/>{favorite ? 'Saved' : 'Save vendor'}
          </button>
        </div>}
      </article>
    </li>
  )
}
