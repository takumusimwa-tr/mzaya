import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Megaphone } from 'lucide-react'
import errandsIllustration from '../../assets/brand/illustrations/onboarding/mzaya-onboarding-errands-02.svg'

/**
 * Customer discovery placements. Only render campaigns supplied by a trusted,
 * approved source. Until the campaign API exists, display a first-party card.
 * Never fabricate vendors, prices, discounts, or availability.
 */
const FALLBACK = {
  id: 'mzaya-errands',
  type: 'first_party',
  eyebrow: 'Discover Mzaya',
  title: 'More than deliveries.',
  description: 'Need something collected or delivered? Explore Mzaya errands.',
  cta: 'Explore errands',
  href: '/errand',
  image: errandsIllustration,
}

export default function PromotionalCarousel({ campaigns = [], onNavigate }) {
  const approved = Array.isArray(campaigns)
    ? campaigns.filter((item) =>
        item && item.status === 'approved' && item.active === true &&
        typeof item.id === 'string' && typeof item.title === 'string' &&
        typeof item.href === 'string' && item.href.startsWith('/') &&
        !item.href.startsWith('//') &&
        (item.type === 'vendor' || item.type === 'product') &&
        item.title.trim() && item.href.trim()
      )
    : []
  const slides = approved.length ? approved : [FALLBACK]
  const [index, setIndex] = useState(0)
  useEffect(() => setIndex(0), [campaigns])
  const activeIndex = Math.min(index, slides.length - 1)
  const slide = slides[activeIndex]
  const sponsored = slide.type !== 'first_party'
  const move = (direction) => setIndex((current) => (current + direction + slides.length) % slides.length)

  return (
    <section className="px-4 pt-5" aria-label="Featured promotions">
      <div className="relative overflow-hidden rounded-2xl bg-[#E7F3EE]">
        <div className="flex min-h-[176px] items-stretch">
          <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center py-5 pl-5 pr-2">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#086C55]">
              {sponsored && <Megaphone size={13} aria-hidden="true" />}
              {sponsored ? 'Sponsored' : slide.eyebrow}
            </div>
            <h2 className="text-[20px] font-extrabold leading-tight tracking-tight text-[#052A25]">{slide.title}</h2>
            {slide.description && <p className="mt-1.5 text-[12px] leading-relaxed text-[#46665C]">{slide.description}</p>}
            <button type="button" onClick={() => onNavigate(slide.href)}
              className="mt-3 w-fit rounded-full bg-[#086C55] px-4 py-2 text-[12px] font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#052A25]">
              {slide.cta || 'Explore'}
            </button>
          </div>
          {slide.image && (
            <img src={slide.image} alt="" aria-hidden="true" loading="lazy"
              className="w-[40%] max-w-[180px] shrink-0 object-cover object-center" />
          )}
        </div>
        {slides.length > 1 && (
          <div className="absolute bottom-2 right-2 z-20 flex gap-1">
            <button type="button" onClick={() => move(-1)} aria-label="Previous promotion"
              className="rounded-full bg-white/90 p-1.5 text-[#052A25]"><ChevronLeft size={16}/></button>
            <button type="button" onClick={() => move(1)} aria-label="Next promotion"
              className="rounded-full bg-white/90 p-1.5 text-[#052A25]"><ChevronRight size={16}/></button>
          </div>
        )}
      </div>
      {slides.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5" aria-label="Promotion position">
          {slides.map((item, i) => (
            <button type="button" key={item.id} onClick={() => setIndex(i)}
              aria-label={`Show promotion ${i + 1}`} aria-current={i === activeIndex ? 'true' : undefined}
              className={`h-1.5 rounded-full transition-all ${i === activeIndex ? 'w-5 bg-[#086C55]' : 'w-1.5 bg-[#CADDD3]'}`} />
          ))}
        </div>
      )}
    </section>
  )
}
