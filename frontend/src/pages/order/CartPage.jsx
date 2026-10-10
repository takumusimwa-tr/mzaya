import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Minus, Plus, Trash2, ChevronRight, StickyNote } from 'lucide-react'
import useCartStore from '../../store/useCartStore'
import Money from '../../components/ui/Money'
import emptyCart from '../../assets/brand/illustrations/empty-states/mzaya-empty-cart.svg'

const T = {
  green: '#00A651', greenDeep: '#0B4A3F', greenTint: '#E9F7EF',
  ink: '#16191A', ink2: '#5F6B66', ink3: '#8C9692', line: '#ECEFED', fill: '#F4F6F5',
}

export default function CartPage() {
  const navigate = useNavigate()
  const cart = useCartStore()
  const { items } = cart
  const subtotal = cart.totalPrice()
  const totalItems = cart.totalItems()

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen flex-col bg-white" style={{ color: T.ink }}>
        <Header onBack={() => navigate(-1)} title="Cart" />
        <div className="flex flex-1 flex-col items-center justify-center px-8 pb-24 text-center">
          <img src={emptyCart} alt="" aria-hidden="true" className="mb-5 w-52 max-w-full select-none" draggable="false" />
          <h2 className="text-[20px] font-extrabold">Your cart is empty</h2>
          <p className="mt-1 text-[14px]" style={{ color: T.ink2 }}>Find something you like and it will show up here.</p>
          <button type="button" onClick={() => navigate('/home')}
            className="mt-6 h-12 rounded-full px-7 text-[15px] font-bold text-white active:scale-95 transition-transform"
            style={{ background: T.green }}>
            Start browsing
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white pb-32" style={{ color: T.ink }}>
      <Header onBack={() => navigate(-1)} title="Your cart"
        action={<button type="button" onClick={() => cart.clearCart()} className="h-11 px-2 text-[14px] font-semibold" style={{ color: T.ink2 }}>Clear</button>} />

      {/* Which store this cart belongs to — one tap back to its menu */}
      <button type="button" onClick={() => navigate(`/vendor/${cart.vendorId}`)}
        className="mx-4 mt-2 flex w-[calc(100%-2rem)] items-center gap-3 rounded-2xl px-4 py-3 text-left active:opacity-80"
        style={{ background: T.fill }}>
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[16px] font-extrabold"
          style={{ background: T.greenTint, color: T.greenDeep }}>{cart.vendorName?.trim().charAt(0).toUpperCase()}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-bold">{cart.vendorName}</span>
          <span className="block text-[13px]" style={{ color: T.ink2 }}>{totalItems} {totalItems === 1 ? 'item' : 'items'} · Add more</span>
        </span>
        <ChevronRight size={18} style={{ color: T.ink3 }} />
      </button>

      <ul className="mt-2 px-4">
        {items.map((item, index) => (
          <li key={`${item.id}-${index}`} className="flex items-start gap-3 border-b py-4 last:border-b-0" style={{ borderColor: T.line }}>
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-bold leading-snug">{item.name}</span>
              {item.special_instructions && (
                <span className="mt-1 flex items-start gap-1.5 text-[13px]" style={{ color: T.ink2 }}>
                  <StickyNote size={13} className="mt-0.5 flex-shrink-0" />{item.special_instructions}
                </span>
              )}
              <span className="mt-1.5 block text-[15px] font-bold"><Money usd={item.unit_price_usd * item.qty} /></span>
              {item.qty > 1 && (
                <span className="block text-[12px]" style={{ color: T.ink3 }}><Money usd={item.unit_price_usd} /> each</span>
              )}
            </span>
            <span className="flex h-10 items-center rounded-full border" style={{ borderColor: T.line }}>
              <button type="button" aria-label={item.qty > 1 ? `One less ${item.name}` : `Remove ${item.name}`}
                onClick={() => (item.qty > 1 ? cart.updateQty(index, item.qty - 1) : cart.removeItem(index))}
                className="flex h-10 w-10 items-center justify-center rounded-full active:bg-black/5">
                {item.qty > 1 ? <Minus size={16} strokeWidth={2.4} /> : <Trash2 size={16} strokeWidth={2.2} style={{ color: '#C0392B' }} />}
              </button>
              <span className="w-6 text-center text-[15px] font-bold" aria-live="polite">{item.qty}</span>
              <button type="button" aria-label={`One more ${item.name}`} onClick={() => cart.updateQty(index, item.qty + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full active:bg-black/5">
                <Plus size={16} strokeWidth={2.4} />
              </button>
            </span>
          </li>
        ))}
      </ul>

      <section className="mx-4 mt-4 border-t pt-4" style={{ borderColor: T.line }}>
        <Row label="Subtotal" value={<Money usd={subtotal} />} strong />
        <Row label="Delivery fee" value="Worked out at checkout" muted />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md bg-white px-4 pt-3"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', boxShadow: '0 -8px 24px rgba(0,0,0,0.06)' }}>
        <button type="button" onClick={() => navigate('/checkout')}
          className="flex h-14 w-full items-center justify-between rounded-full px-6 text-[16px] font-bold text-white active:scale-[0.99] transition-transform"
          style={{ background: T.green }}>
          <span>Go to checkout</span>
          <Money usd={subtotal} />
        </button>
      </div>
    </main>
  )
}

function Header({ title, onBack, action }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-1 bg-white/95 px-2 backdrop-blur"
      style={{ paddingTop: 'env(safe-area-inset-top)', boxSizing: 'content-box' }}>
      <button type="button" aria-label="Back" onClick={onBack} className="flex h-11 w-11 items-center justify-center rounded-full active:bg-black/5">
        <ArrowLeft size={21} strokeWidth={2.2} />
      </button>
      <h1 className="flex-1 text-[18px] font-extrabold">{title}</h1>
      {action}
    </header>
  )
}

function Row({ label, value, strong, muted }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-[15px]">
      <span style={{ color: strong ? T.ink : T.ink2 }} className={strong ? 'font-bold' : ''}>{label}</span>
      <span className={strong ? 'font-bold' : ''} style={{ color: muted ? T.ink3 : T.ink }}>{value}</span>
    </div>
  )
}

