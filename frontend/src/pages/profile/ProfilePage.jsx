import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'

const ROLE_HOME = {
  customer: '/home',
  rider:    '/rider',
  vendor:   '/vendor',
  admin:    '/admin',
}

const ROLE_COLOR = {
  customer: 'bg-green-100 text-green-700',
  rider:    'bg-green-100 text-green-700',
  vendor:   'bg-green-100 text-green-700',
  admin:    'bg-gray-100 text-gray-700',
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const homeRoute = ROLE_HOME[user?.role] || '/home'
  const roleColor = ROLE_COLOR[user?.role] || 'bg-gray-100 text-gray-700'

  return (
    <div className="pb-24">
      {/* Header with back button */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button
          onClick={() => navigate(homeRoute)}
          className="p-2 rounded-full bg-gray-100"
        >
          <BackIcon />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center py-6 bg-white border-b border-gray-100">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-3xl mb-3">
          {user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <p className="text-lg font-bold text-gray-900">{user?.name}</p>
        <p className="text-sm text-gray-500">{user?.phone}</p>
        <span className={`mt-2 text-xs font-semibold px-3 py-1 rounded-full capitalize ${roleColor}`}>
          {user?.role}
        </span>
      </div>

      {/* Menu items */}
      <div className="px-4 mt-4 flex flex-col gap-3">
        {user?.role === 'customer' && (
          <ProfileMenuItem icon="parcel" label="My Orders" onClick={() => navigate('/orders')} />
        )}
        {user?.role === 'customer' && (
          <ProfileMenuItem icon="favorite" label="Favorites" onClick={() => navigate('/favorites')} />
        )}
        {user?.role === 'customer' && (
          <ProfileMenuItem icon="store" label="Sell on Mzaya" onClick={() => navigate('/sell')} />
        )}
        {user?.role === 'rider' && (
          <ProfileMenuItem icon="rider" label="Vehicle & City" onClick={() => navigate('/rider/setup')} />
        )}
        {user?.role === 'rider' && (
          <ProfileMenuItem icon="earnings" label="My Earnings" onClick={() => navigate('/rider/earnings')} />
        )}
        {user?.role === 'vendor' && (
          <ProfileMenuItem icon="orders" label="My Orders" onClick={() => navigate('/vendor/orders')} />
        )}
        {user?.role === 'vendor' && (
          <ProfileMenuItem icon="menu" label="My Menu" onClick={() => navigate('/vendor/menu')} />
        )}
        {user?.role === 'customer' && (
          <ProfileMenuItem icon="location" label="Saved Addresses" onClick={() => navigate('/addresses')} />
        )}
        <ProfileMenuItem icon="notify" label="Notifications" onClick={() => {}} badge="Coming soon" />
        <ProfileMenuItem icon="help" label="Help & Support" onClick={() => {}} />
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">Mzaya v1.0.0 · Built for Zimbabwe</p>

      <div className="px-4 mt-4">
        <Button variant="danger" size="lg" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  )
}

function ProfileMenuItem({ icon, label, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-98 transition-transform"
    >
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#EDFAF3', color: '#00A651' }}>
          <Icon name={icon} size={18} />
        </span>
        <span className="text-sm font-medium text-gray-800">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{badge}</span>}
        <span className="text-gray-400">›</span>
      </div>
    </button>
  )
}

function BackIcon() {
  return (
    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}
