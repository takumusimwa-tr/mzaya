import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/vendor',        label: 'Home',   icon: HomeIcon  },
  { to: '/vendor/orders', label: 'Orders', icon: OrderIcon },
  { to: '/vendor/menu',   label: 'Menu',   icon: MenuIcon  },
]

export default function VendorBottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex z-50"
      style={{ boxShadow: '0 -1px 12px rgba(0,0,0,0.06)' }}>
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} end
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 gap-1 text-xs font-semibold transition-colors
             ${isActive ? 'text-green-600' : 'text-gray-400'}`
          }
        >
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function HomeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function OrderIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  )
}
