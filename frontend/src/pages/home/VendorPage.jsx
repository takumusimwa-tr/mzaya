import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Clock, Heart, Plus, Search, Share2, ShoppingBag, Star, X } from 'lucide-react'
import { vendorAPI } from '../../api/api'
import useCartStore from '../../store/useCartStore'
import LoadingScreen from '../../components/ui/LoadingScreen'
import ItemModal from '../../components/ItemModal'
import Icon from '../../components/ui/Icon'
import Money from '../../components/ui/Money'
import imageUrl from '../../utils/imageUrl'
import cartVendor from '../../utils/cartVendor'
import { useFavoriteIds } from '../../hooks/useFavorites'

const T = {
  green: '#00A651',
  greenDeep: '#0B4A3F',
  greenTint: '#E9F7EF',
  ink: '#16191A',
  ink2: '#5F6B66',
  ink3: '#8C9692',
  line: '#ECEFED',
  fill: '#F4F6F5',
}

const CATEGORY_LABEL = { food: 'Restaurant', grocery: 'Grocery', materials: 'Hardware', errand: 'Errands' }
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const DAY_NAMES = { sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday' }

// Opening hours are judged in Harare time on the server, so the copy here uses
// Harare time too, not whatever the phone's clock says.
function harareNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Harare', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date())
  const get = (t) => parts.find((p) => p.type === t)?.value
  return { day: get('weekday').toLowerCase().slice(0, 3), time: `${get('hour')}:${get('minute')}` }
}

// "Closes 22:00" when open; "Opens 08:00", "Opens tomorrow 08:00" or
// "Opens Monday 08:00" when closed. Null when the store hasn't set hours.
function hoursLine(hours, isOpen) {
  if (!hours) return null
  const { day, time } = harareNow()
  const today = hours[day]
  if (isOpen) return today?.close ? `Closes ${today.close}` : null
  if (today && !today.closed && today.open > time) return `Opens ${today.open}`
  const start = DAY_KEYS.indexOf(day)
  for (let i = 1; i <= 7; i += 1) {
    const key = DAY_KEYS[(start + i) % 7]
    const d = hours[key]
    if (d && !d.closed && d.open) return `Opens ${i === 1 ? 'tomorrow' : DAY_NAMES[key]} ${d.open}`
  }
  return null
}

export default function VendorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const cart = useCartStore()
  const { isFavorite, toggle } = useFavoriteIds()

  const [activeItem, setActiveItem] = useState(null)
  const [activeSection, setActiveSection] = useState(null)
  const [menuSearch, setMenuSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [toast, setToast] = useState(null)
  const sectionRefs = useRef({})
  const tabsRef = useRef(null)
  const jumpLock = useRef(false)
  const [scrolled, setScrolled] = useState(false)

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', id],
    queryFn: () => vendorAPI.getById(id).then((r) => r.data.vendor),
  })

  // Arrived from a product tap (?highlight=itemId): open that item straight away.
  useEffect(() => {
    if (!highlightId || !vendor?.menuItems) return
    const item = vendor.menuItems.find((i) => i.id === highlightId)
    if (item) setActiveItem(item)
  }, [highlightId, vendor])

  const menuItems = useMemo(() => vendor?.menuItems || [], [vendor])
  const sections = useMemo(() => {
    const q = menuSearch.trim().toLowerCase()
    const groups = {}
    for (const item of menuItems) {
      if (q && !`${item.name} ${item.description || ''}`.toLowerCase().includes(q)) continue
      const key = item.category || 'Menu'
      ;(groups[key] = groups[key] || []).push(item)
    }
    return Object.entries(groups)
  }, [menuItems, menuSearch])

  // Scroll-spy. The observer only reports sections whose visibility CHANGED, so
  // keep the full visible set and pick the first one in page order.
  useEffect(() => {
    if (!sections.length) return undefined
    const visible = new Set()
    const order = sections.map(([name]) => name)
    const observer = new IntersectionObserver((entries) => {
      if (jumpLock.current) return  // a tab tap is driving the scroll
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.dataset.section) : visible.delete(e.target.dataset.section)))
      const first = order.find((name) => visible.has(name))
      if (first) setActiveSection(first)
    }, { rootMargin: '-120px 0px -55% 0px' })
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  // Compact header once the cover has scrolled away, so Back is always reachable.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 170)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Keep the active tab visible in the horizontally scrolling bar.
  useEffect(() => {
    tabsRef.current?.querySelector(`[data-tab="${CSS.escape(activeSection || '')}"]`)
      ?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [activeSection])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(null), 1800)
    return () => clearTimeout(t)
  }, [toast])

  if (isLoading) return <LoadingScreen message="Loading menu..." />
  if (!vendor) return <div className="p-6 text-center" style={{ color: T.ink2 }}>We couldn&apos;t find this store.</div>

  const open = !!vendor.is_open
  const rating = Number(vendor.rating) || 0
  // Typical prep time: the median, rounded to 5 min. A min-max range let a
  // soft drink ("2 min") make a kitchen look faster than it is.
  const prepTimes = menuItems.map((i) => Number(i.prep_minutes)).filter((n) => n > 0).sort((x, y) => x - y)
  const median = prepTimes.length ? prepTimes[Math.floor(prepTimes.length / 2)] : 0
  const prepLine = median ? `Usually ready in ~${Math.max(5, Math.round(median / 5) * 5)} min` : null
  const hours = hoursLine(vendor.opening_hours, open)
  const favourite = vendor.brand_id ? isFavorite(vendor.brand_id) : false
  const cartCount = cart.totalItems()
  const inCart = (itemId) => cart.items.filter((i) => i.id === itemId).reduce((n, i) => n + i.qty, 0)

  const quickAdd = (item) => {
    cart.addItem({
      id: item.id,
      name: item.name,
      unit_price_usd: Number(item.price_usd),
      qty: 1,
      special_instructions: null,
      weight_kg: item.weight_kg || 0.5,
      prep_minutes: item.prep_minutes || 0,
    }, cartVendor(vendor))
    setToast(`Added ${item.name}`)
  }

  const jumpTo = (name) => {
    setActiveSection(name)
    jumpLock.current = true
    setTimeout(() => { jumpLock.current = false }, 700)
    const el = sectionRefs.current[name]
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 112, behavior: 'smooth' })
    // 112px = compact header (56) + tabs (48) + breathing room
  }

  const share = async () => {
    const data = { title: vendor.name, text: `Order from ${vendor.name} on Mzaya`, url: window.location.href }
    try {
      if (navigator.share) await navigator.share(data)
      else { await navigator.clipboard.writeText(data.url); setToast('Link copied') }
    } catch { /* user dismissed the share sheet */ }
  }

  return (
    <main className="min-h-screen bg-white pb-32" style={{ color: T.ink }}>
      {/* ── Cover with floating controls ─────────────────────────────────── */}
      <div className="relative h-[200px] overflow-hidden" style={{ background: `linear-gradient(135deg, ${T.greenDeep}, #13805A)` }}>
        {vendor.cover_url ? (
          <img src={imageUrl(vendor.cover_url, 900)} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="absolute -right-6 -top-4 text-white/10" aria-hidden="true"><Icon name={vendor.category || 'food'} size={220} /></span>
        )}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4" style={{ paddingTop: 'max(env(safe-area-inset-top), 14px)' }}>
          <FloatingButton label="Back" onClick={() => navigate(-1)}><ArrowLeft size={20} strokeWidth={2.2} /></FloatingButton>
          <div className="flex gap-2">
            <FloatingButton label="Search the menu" onClick={() => setSearching(true)}><Search size={19} strokeWidth={2.2} /></FloatingButton>
            <FloatingButton label="Share this store" onClick={share}><Share2 size={18} strokeWidth={2.2} /></FloatingButton>
            {vendor.brand_id && (
              <FloatingButton label={favourite ? 'Remove from favourites' : 'Save to favourites'} onClick={() => toggle(vendor.brand_id)}>
                <Heart size={19} strokeWidth={2.2} fill={favourite ? T.green : 'none'} style={{ color: favourite ? T.green : T.ink }} />
              </FloatingButton>
            )}
          </div>
        </div>
      </div>

      {/* ── Store identity ───────────────────────────────────────────────── */}
      <section className="relative px-4">
        <div className="-mt-9 mb-3 h-[72px] w-[72px] overflow-hidden rounded-2xl bg-white p-1 shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
          {vendor.logo_url ? (
            <img src={imageUrl(vendor.logo_url, 200)} alt="" className="h-full w-full rounded-xl object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center rounded-xl text-[26px] font-extrabold" style={{ background: T.greenTint, color: T.greenDeep }}>
              {vendor.name?.trim().charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.02em]">{vendor.name}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[14px]" style={{ color: T.ink2 }}>
          {rating > 0 ? (
            <><Star size={13} fill={T.ink} strokeWidth={0} /><span className="font-semibold" style={{ color: T.ink }}>{rating.toFixed(1)}</span></>
          ) : <span className="font-semibold" style={{ color: T.green }}>New on Mzaya</span>}
          <span style={{ color: T.ink3 }}>·</span>
          <span>{CATEGORY_LABEL[vendor.category] || 'Store'}</span>
        </p>
        {vendor.address && <p className="mt-0.5 truncate text-[13px]" style={{ color: T.ink3 }}>{vendor.address}</p>}

        {/* Only facts we actually know: status, hours, prep time. Delivery fees
            depend on distance and vehicle, so they're quoted at checkout. */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <InfoTile
            title={open ? 'Open now' : 'Closed'}
            sub={hours || (open ? 'Taking orders' : 'Browse the menu')}
            tone={open ? 'green' : 'muted'} />
          <InfoTile
            title={prepLine || 'Prep time varies'}
            sub="Delivery fee at checkout"
            icon={<Clock size={14} strokeWidth={2.4} />} />
        </div>
      </section>

      {/* ── Sticky header: compact bar once scrolled, then section tabs ──── */}
      <div className="sticky top-0 z-30 mt-5 bg-white/95 backdrop-blur" style={{ paddingTop: scrolled ? 'env(safe-area-inset-top)' : 0 }}>
        {scrolled && (
          <div className="flex h-14 items-center gap-2 px-2">
            <button type="button" aria-label="Back" onClick={() => navigate(-1)} className="flex h-11 w-11 items-center justify-center rounded-full active:bg-black/5">
              <ArrowLeft size={21} strokeWidth={2.2} />
            </button>
            <p className="min-w-0 flex-1 truncate text-[16px] font-extrabold">{vendor.name}</p>
            <button type="button" aria-label="Search the menu" onClick={() => setSearching(true)} className="flex h-11 w-11 items-center justify-center rounded-full active:bg-black/5">
              <Search size={20} strokeWidth={2.2} />
            </button>
          </div>
        )}
        {sections.length > 0 && (
          <nav ref={tabsRef} aria-label="Menu sections"
            className="flex gap-6 overflow-x-auto border-b px-4 no-scrollbar" style={{ borderColor: T.line }}>
            {sections.map(([name]) => {
              const active = (activeSection || sections[0][0]) === name
              return (
                <button key={name} type="button" data-tab={name} onClick={() => jumpTo(name)}
                  className="relative flex h-12 flex-shrink-0 items-center text-[14px] font-bold"
                  style={{ color: active ? T.ink : T.ink3 }} aria-current={active ? 'true' : undefined}>
                  {name}
                  {active && <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full" style={{ background: T.green }} />}
                </button>
              )
            })}
          </nav>
        )}
      </div>

      {/* ── Menu ─────────────────────────────────────────────────────────── */}
      <div className="px-4">
        {menuSearch && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-[14px]" style={{ color: T.ink2 }}>Results for <span className="font-bold" style={{ color: T.ink }}>&ldquo;{menuSearch}&rdquo;</span></p>
            <button type="button" onClick={() => setMenuSearch('')} className="text-[13px] font-bold" style={{ color: T.green }}>Clear</button>
          </div>
        )}
        {sections.length === 0 ? (
          <p className="py-16 text-center text-[14px]" style={{ color: T.ink2 }}>
            {menuSearch ? 'Nothing on the menu matches that.' : 'This store hasn\u2019t added its menu yet.'}
          </p>
        ) : sections.map(([name, items]) => (
          <section key={name} data-section={name} ref={(el) => { sectionRefs.current[name] = el }} className="pt-6">
            <h2 className="mb-1 text-[20px] font-extrabold tracking-[-0.02em]">{name}</h2>
            <ul>
              {items.map((item) => (
                <MenuRow key={item.id} item={item} category={vendor.category} open={open} count={inCart(item.id)}
                  onOpen={() => setActiveItem(item)} onQuickAdd={() => quickAdd(item)} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <div role="status" className="fixed inset-x-0 z-50 flex justify-center px-4" style={{ bottom: `calc(${cartCount > 0 ? 88 : 24}px + env(safe-area-inset-bottom))` }}>
          <span className="rounded-full px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg" style={{ background: T.ink }}>{toast}</span>
        </div>
      )}

      {/* ── Cart bar ─────────────────────────────────────────────────────── */}
      {cartCount > 0 && (
        <div className="fixed inset-x-0 z-40 px-4" style={{ bottom: 'calc(16px + env(safe-area-inset-bottom))' }}>
          <button type="button" onClick={() => navigate('/cart')}
            className="mx-auto flex h-14 w-full max-w-md items-center gap-3 rounded-full px-5 text-white shadow-[0_10px_28px_rgba(0,166,81,0.35)] transition-transform active:scale-[0.99]"
            style={{ background: T.green }}>
            <ShoppingBag size={20} strokeWidth={2.2} />
            <span className="flex-1 text-left leading-tight">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-white/80">View cart · {cartCount}</span>
              <span className="block truncate text-[15px] font-bold">{cart.vendorName || vendor.name}</span>
            </span>
            <span className="text-[15px] font-bold"><Money usd={cart.totalPrice()} /></span>
          </button>
        </div>
      )}

      {/* ── Menu search ──────────────────────────────────────────────────── */}
      {searching && (
        <MenuSearch vendorName={vendor.name} initial={menuSearch}
          onClose={() => setSearching(false)}
          onSubmit={(q) => { setMenuSearch(q.trim()); setSearching(false); window.scrollTo({ top: 0 }) }} />
      )}

      {activeItem && <ItemModal item={activeItem} vendor={vendor} canOrder={open} onClose={() => setActiveItem(null)} />}
    </main>
  )
}

function FloatingButton({ label, onClick, children }) {
  return (
    <button type="button" aria-label={label} onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.15)] active:scale-95 transition-transform"
      style={{ color: T.ink }}>
      {children}
    </button>
  )
}

function InfoTile({ title, sub, tone, icon }) {
  const color = tone === 'green' ? '#0A7A3D' : tone === 'muted' ? T.ink2 : T.ink
  return (
    <div className="rounded-xl border px-3 py-2.5" style={{ borderColor: T.line }}>
      <p className="flex items-center gap-1.5 text-[14px] font-bold" style={{ color }}>
        {tone === 'green' && <span className="h-2 w-2 rounded-full" style={{ background: T.green }} />}
        {icon}{title}
      </p>
      <p className="mt-0.5 truncate text-[12px]" style={{ color: T.ink2 }}>{sub}</p>
    </div>
  )
}

function MenuRow({ item, category, open, count, onOpen, onQuickAdd }) {
  return (
    <li className="border-b last:border-b-0" style={{ borderColor: T.line }}>
      <div className="relative flex gap-3 py-4">
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left active:opacity-70">
          <span className="block text-[16px] font-bold leading-snug">{item.name}</span>
          {item.description && (
            <span className="mt-1 block line-clamp-2 text-[13px] leading-snug" style={{ color: T.ink2 }}>{item.description}</span>
          )}
          <span className="mt-1.5 flex items-center gap-1.5 text-[14px]">
            <span className="font-bold"><Money usd={item.price_usd} /></span>
            {count > 0 && <span className="rounded-md px-1.5 py-0.5 text-[11px] font-bold" style={{ background: T.greenTint, color: '#0A7A3D' }}>{count} in cart</span>}
          </span>
        </button>
        <div className="relative h-[104px] w-[104px] flex-shrink-0">
          <button type="button" onClick={onOpen} aria-label={`View ${item.name}`}
            className="h-full w-full overflow-hidden rounded-xl" style={{ background: T.fill }}>
            {item.image_url ? (
              <img src={imageUrl(item.image_url, 320)} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center" style={{ color: '#C3CBC7' }}><Icon name={category || 'food'} size={34} /></span>
            )}
          </button>
          {open && (
            <button type="button" onClick={onQuickAdd} aria-label={`Add ${item.name} to cart`}
              className="absolute -bottom-2 -right-2 flex h-9 min-w-9 items-center justify-center rounded-full bg-white px-2 shadow-[0_3px_10px_rgba(0,0,0,0.18)] active:scale-90 transition-transform"
              style={{ color: count ? '#fff' : T.ink, background: count ? T.green : '#fff' }}>
              {count ? <span className="text-[13px] font-bold">{count}</span> : <Plus size={18} strokeWidth={2.6} />}
            </button>
          )}
        </div>
      </div>
    </li>
  )
}

function MenuSearch({ vendorName, initial, onClose, onSubmit }) {
  const [value, setValue] = useState(initial)
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])
  return (
    <div className="fixed inset-0 z-[70] bg-white" role="dialog" aria-label={`Search ${vendorName}`}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(value) }}
        className="flex items-center gap-2 px-3 pb-3" style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}>
        <button type="button" onClick={onClose} aria-label="Close search" className="flex h-11 w-11 items-center justify-center rounded-full active:bg-black/5">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <label className="flex h-11 flex-1 items-center gap-2.5 rounded-full px-4" style={{ background: T.fill }}>
          <Search size={18} strokeWidth={2.2} />
          <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} placeholder={`Search ${vendorName}`}
            enterKeyHint="search" className="h-full flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#8C9692]" />
          {value && (
            <button type="button" onClick={() => setValue('')} aria-label="Clear" className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: '#DDE2DF' }}>
              <X size={13} strokeWidth={2.6} />
            </button>
          )}
        </label>
      </form>
    </div>
  )
}
