import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'

const tabs = [
  { to: '/vendor',        label: 'Home',   icon: HomeIcon,  end: true  },
  { to: '/vendor/orders', label: 'Orders', icon: OrderIcon, end: false },
  { to: '/vendor/menu',   label: 'Menu',   icon: MenuIcon,  end: false },
]

export default function VendorSideRail() {
  const navigate = useNavigate()
  const logout   = useAuthStore((s) => s.logout)
  const user     = useAuthStore((s) => s.user)

  const handleLogout = () => {
    logout?.()
    navigate('/welcome', { replace: true })
  }

  return (
    <aside className="w-20 lg:w-24 shrink-0 h-screen bg-white border-r border-gray-200 flex flex-col items-center py-5">
      {/* Brand mark */}
      <div className="mb-8">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: '#FF3008' }}>
          <span className="text-white font-black text-lg">M</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-2 w-full items-center">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `w-16 lg:w-20 py-3 rounded-2xl flex flex-col items-center gap-1 text-[11px] font-semibold transition-all
               ${isActive ? 'bg-orange-50 text-orange-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Profile / logout */}
      <div className="mt-auto flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
          {user?.name?.charAt(0)?.toUpperCase() || 'V'}
        </div>
        <button onClick={handleLogout}
          className="w-16 lg:w-20 py-2.5 rounded-2xl flex flex-col items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

function HomeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function OrderIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}
