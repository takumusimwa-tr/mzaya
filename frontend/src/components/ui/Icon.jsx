// Mzaya icon system.
//
// Every functional icon in the app comes from here. Emoji were previously doing
// this job, which was a problem: emoji render differently on every device (and
// our users are largely on budget Android handsets with inconsistent emoji
// fonts — some render tofu boxes), they carry Western defaults (a knife-and-fork
// for food, a sport bike for a rider), and emoji-as-UI reads as unfinished.
//
// Defining them centrally means an icon is swapped in ONE place, not thirty.
//
// Emoji are still fine for genuinely *expressive* moments (celebration, tone) —
// just not for identity, navigation, or status.
// Brand icons — hand-drawn Mzaya set for categories and errand services. They're
// stroke-based currentColor SVGs, so they inherit active/inactive colours exactly
// like Lucide. Imported ?raw and rendered inline (an <img> would flatten
// currentColor). Lucide stays for ordinary UI actions, per the brand guidelines.
import brandFood      from '../../assets/brand/icons/categories/mzaya-category-food.svg?raw'
import brandGrocery   from '../../assets/brand/icons/categories/mzaya-category-grocery.svg?raw'
import brandMaterials from '../../assets/brand/icons/categories/mzaya-category-materials.svg?raw'
import brandErrands   from '../../assets/brand/icons/categories/mzaya-category-errands.svg?raw'
import brandCourier   from '../../assets/brand/icons/categories/mzaya-category-courier.svg?raw'
import brandPharmacy  from '../../assets/brand/icons/categories/mzaya-category-pharmacy.svg?raw'
import brandMore      from '../../assets/brand/icons/categories/mzaya-category-more.svg?raw'
import brandZimra     from '../../assets/brand/icons/services/mzaya-service-zimra.svg?raw'
import brandBank      from '../../assets/brand/icons/services/mzaya-service-bank-queue.svg?raw'
import brandDocument  from '../../assets/brand/icons/services/mzaya-service-document-delivery.svg?raw'
import brandShopping  from '../../assets/brand/icons/services/mzaya-service-shopping-run.svg?raw'
import brandBill      from '../../assets/brand/icons/services/mzaya-service-bill-payment.svg?raw'
import brandOther     from '../../assets/brand/icons/services/mzaya-service-other.svg?raw'

import {
  // Categories
  UtensilsCrossed, ShoppingCart, HardHat, ClipboardList,
  // Errand types
  Landmark, Building2, FileText, ShoppingBag, Receipt,
  // Order lifecycle
  Search, Bike, Package, Navigation, CheckCircle2, XCircle,
  // Actions / nav
  MessageCircle, Phone, Camera, MapPin, RotateCw, Star, Bell,
  Heart, Store, Wallet, HelpCircle, Send, X, Check, Truck,
  Ticket, StickyNote, Handshake, Sparkles, AlertTriangle,
  Radio, ImageIcon, CircleDollarSign, Banknote,
} from 'lucide-react'

// Semantic name → Lucide component.
// Callers use the CONCEPT ("food", "rider"), never the vendor's icon name — so
// switching icon libraries later touches only this file.
// Concepts with a bespoke Mzaya glyph. Checked before the Lucide map, so a brand
// icon wins wherever one exists and Lucide covers the rest.
const BRAND_ICONS = {
  food:      brandFood,
  grocery:   brandGrocery,
  materials: brandMaterials,
  errand:    brandErrands,
  courier:   brandCourier,
  pharmacy:  brandPharmacy,
  more:      brandMore,
  zimra:     brandZimra,
  bank:      brandBank,
  document:  brandDocument,
  shopping:  brandShopping,
  bill:      brandBill,
  service:   brandOther,
}

const ICONS = {
  // Categories (Lucide fallbacks — BRAND_ICONS takes precedence at render)
  food:        UtensilsCrossed,
  grocery:     ShoppingCart,
  materials:   HardHat,
  errand:      ClipboardList,

  // Errand subtypes
  zimra:       Landmark,
  bank:        Building2,
  document:    FileText,
  shopping:    ShoppingBag,
  bill:        Receipt,

  // Order lifecycle / status
  searching:   Search,
  rider:       Bike,          // commuter bike, not a sport bike
  parcel:      Package,
  enroute:     Navigation,
  delivered:   CheckCircle2,
  cancelled:   XCircle,
  waiting:     Radio,

  // Actions
  chat:        MessageCircle,
  call:        Phone,
  camera:      Camera,
  photo:       ImageIcon,
  location:    MapPin,
  reorder:     RotateCw,
  rate:        Star,
  notify:      Bell,
  favorite:    Heart,
  store:       Store,
  earnings:    Wallet,
  money:       CircleDollarSign,
  cash:        Banknote,
  help:        HelpCircle,
  send:        Send,
  close:       X,
  check:       Check,
  vehicle:     Truck,
  promo:       Ticket,
  note:        StickyNote,
  negotiate:   Handshake,
  ai:          Sparkles,
  warning:     AlertTriangle,
  orders:      ClipboardList,
  menu:        UtensilsCrossed,
}

/**
 * <Icon name="food" />            → 20px, inherits colour
 * <Icon name="rider" size={32} /> → sized
 * <Icon name="chat" className="text-green-600" />
 */
export default function Icon({ name, size = 20, className = '', strokeWidth = 2, ...rest }) {
  const Cmp = ICONS[name]
  if (!Cmp) {
    if (import.meta.env.DEV) console.warn(`[Icon] unknown name: "${name}"`)
    return null
  }
  return <Cmp size={size} strokeWidth={strokeWidth} className={className} {...rest} />
}

export { ICONS }
