import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import Button from '../../components/ui/Button'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="pb-24">
      <div className="px-4 pt-14 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center py-6 bg-white border-b border-gray-100">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-3xl mb-3">
          {user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <p className="text-lg font-bold text-gray-900">{user?.name}</p>
        <p className="text-sm text-gray-500">{user?.phone}</p>
        <span className="mt-2 text-xs bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full capitalize">
          {user?.role}
        </span>
      </div>

      {/* Menu items */}
      <div className="px-4 mt-4 flex flex-col gap-3">
        <ProfileMenuItem
          icon="📦"
          label="My Orders"
          onClick={() => navigate('/orders')}
        />
        <ProfileMenuItem
          icon="📍"
          label="Saved Addresses"
          onClick={() => {}}
          badge="Coming soon"
        />
        <ProfileMenuItem
          icon="💳"
          label="Payment Methods"
          onClick={() => {}}
          badge="Coming soon"
        />
        <ProfileMenuItem
          icon="🔔"
          label="Notifications"
          onClick={() => {}}
          badge="Coming soon"
        />
        <ProfileMenuItem
          icon="❓"
          label="Help & Support"
          onClick={() => {}}
        />
      </div>

      {/* App info */}
      <div className="px-4 mt-6">
        <p className="text-xs text-gray-400 text-center">Mzaya v1.0.0 · Built for Zimbabwe</p>
      </div>

      {/* Logout */}
      <div className="px-4 mt-6">
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
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-medium text-gray-800">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{badge}</span>
        )}
        <span className="text-gray-400">›</span>
      </div>
    </button>
  )
}
