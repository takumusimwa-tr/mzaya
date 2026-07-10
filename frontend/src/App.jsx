import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './store/useAuthStore'
import { connectSocket, disconnectSocket } from './realtime/socket'

// Onboarding
import OnboardingPage from './pages/onboarding/OnboardingPage'

// Customer
import LoginPage     from './pages/auth/LoginPage'
import RegisterPage  from './pages/auth/RegisterPage'
import HomePage      from './pages/home/HomePage'
import VendorPage    from './pages/home/VendorPage'
import ErrandPage    from './pages/home/ErrandPage'
import CartPage      from './pages/order/CartPage'
import CheckoutPage  from './pages/order/CheckoutPage'
import OrdersPage    from './pages/order/OrdersPage'
import OrderDetail   from './pages/order/OrderDetail'
import TrackingPage  from './pages/tracking/TrackingPage'
import ProfilePage   from './pages/profile/ProfilePage'
import FavoritesPage from './pages/profile/FavoritesPage'
import AddressesPage from './pages/profile/AddressesPage'

// Rider
import RiderHome        from './pages/rider/RiderHome'
import RiderDelivery    from './pages/rider/RiderDelivery'
import RiderNegotiate   from './pages/rider/RiderNegotiate'
import RiderEarnings    from './pages/rider/RiderEarnings'
import RiderProfilePage from './pages/rider/RiderProfilePage'

// Vendor (tablet-locked full-width console)
import VendorHome    from './pages/vendor/VendorHome'
import VendorOrders  from './pages/vendor/VendorOrders'
import VendorMenu    from './pages/vendor/VendorMenu'
import VendorSettings from './pages/vendor/VendorSettings'
import VendorAnalytics from './pages/vendor/VendorAnalytics'
import VendorOnboarding from './pages/vendor/VendorOnboarding'
import VendorAddBranch from './pages/vendor/VendorAddBranch'

// Admin
import AdminHome     from './pages/admin/AdminHome'

// Layout
import BottomNav       from './components/layout/BottomNav'
import RiderBottomNav  from './components/layout/RiderBottomNav'
import VendorSideRail  from './components/layout/VendorSideRail'

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/welcome" replace />
  return children
}

function GuestRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  if (token) return <Navigate to="/" replace />
  return children
}

function RootRedirect() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/welcome" replace />
  if (user.role === 'rider')  return <Navigate to="/rider"  replace />
  if (user.role === 'vendor') return <Navigate to="/vendor" replace />
  if (user.role === 'admin')  return <Navigate to="/admin"  replace />
  return <Navigate to="/home" replace />
}

// Vendor pages render full-width (tablet); everything else stays phone-width.
function AppShell() {
  const user  = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const role  = user?.role
  const location = useLocation()

  const isVendorArea = role === 'vendor' && location.pathname.startsWith('/vendor')

  // Vendor console: full-width tablet layout with a left side rail.
  if (token && isVendorArea) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <VendorSideRail />
        <main className="flex-1 min-w-0 h-screen overflow-hidden">
          <Routes>
            <Route path="/vendor"        element={<ProtectedRoute><VendorHome /></ProtectedRoute>} />
            <Route path="/vendor/orders" element={<ProtectedRoute><VendorOrders /></ProtectedRoute>} />
            <Route path="/vendor/menu"   element={<ProtectedRoute><VendorMenu /></ProtectedRoute>} />
            <Route path="/vendor/settings" element={<ProtectedRoute><VendorSettings /></ProtectedRoute>} />
            <Route path="/vendor/analytics" element={<ProtectedRoute><VendorAnalytics /></ProtectedRoute>} />
            <Route path="/vendor/branches/new" element={<ProtectedRoute><VendorAddBranch /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/vendor" replace />} />
          </Routes>
        </main>
      </div>
    )
  }

  // Phone-width shell for customer / rider / auth / admin.
  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <Routes>
        <Route path="/welcome"  element={<GuestRoute><OnboardingPage /></GuestRoute>} />
        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        <Route path="/" element={<ProtectedRoute><RootRedirect /></ProtectedRoute>} />

        {/* Customer */}
        <Route path="/home"       element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/vendor/:id" element={<ProtectedRoute><VendorPage /></ProtectedRoute>} />
        <Route path="/errand"     element={<ProtectedRoute><ErrandPage /></ProtectedRoute>} />
        <Route path="/cart"       element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/checkout"   element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/orders"     element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        <Route path="/track/:id"  element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
        <Route path="/profile"    element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/favorites"  element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
        <Route path="/addresses"  element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
        <Route path="/sell"       element={<ProtectedRoute><VendorOnboarding /></ProtectedRoute>} />

        {/* Rider */}
        <Route path="/rider"              element={<ProtectedRoute><RiderHome /></ProtectedRoute>} />
        <Route path="/rider/setup"        element={<ProtectedRoute><RiderProfilePage /></ProtectedRoute>} />
        <Route path="/rider/delivery/:id" element={<ProtectedRoute><RiderDelivery /></ProtectedRoute>} />
        <Route path="/rider/negotiate"    element={<ProtectedRoute><RiderNegotiate /></ProtectedRoute>} />
        <Route path="/rider/earnings"     element={<ProtectedRoute><RiderEarnings /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute><AdminHome /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to={token ? '/' : '/welcome'} replace />} />
      </Routes>

      {token && role === 'customer' && <BottomNav />}
      {token && role === 'rider' && location.pathname !== '/rider/setup' && <RiderBottomNav />}
    </div>
  )
}

export default function App() {
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (token) {
      connectSocket(token)
      return () => disconnectSocket()
    }
  }, [token])

  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
