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
const ICONS = {
  // Categories
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
