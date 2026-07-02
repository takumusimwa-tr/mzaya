import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/useAuthStore'

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
import RiderEarnings    from './pages/rider/RiderEarnings'
import RiderProfilePage from './pages/rider/RiderProfilePage'

// Vendor
import VendorHome    from './pages/vendor/VendorHome'
import VendorOrders  from './pages/vendor/VendorOrders'
import VendorMenu    from './pages/vendor/VendorMenu'

// Admin
import AdminHome     from './pages/admin/AdminHome'

// Layout
import BottomNav       from './components/layout/BottomNav'
import RiderBottomNav  from './components/layout/RiderBottomNav'
import VendorBottomNav from './components/layout/VendorBottomNav'

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

export default function App() {
  const user  = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const role  = user?.role

  return (
    <BrowserRouter>
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

          {/* Rider */}
          <Route path="/rider"              element={<ProtectedRoute><RiderHome /></ProtectedRoute>} />
          <Route path="/rider/setup"        element={<ProtectedRoute><RiderProfilePage /></ProtectedRoute>} />
          <Route path="/rider/delivery/:id" element={<ProtectedRoute><RiderDelivery /></ProtectedRoute>} />
          <Route path="/rider/earnings"     element={<ProtectedRoute><RiderEarnings /></ProtectedRoute>} />

          {/* Vendor */}
          <Route path="/vendor"        element={<ProtectedRoute><VendorHome /></ProtectedRoute>} />
          <Route path="/vendor/orders" element={<ProtectedRoute><VendorOrders /></ProtectedRoute>} />
          <Route path="/vendor/menu"   element={<ProtectedRoute><VendorMenu /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute><AdminHome /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to={token ? '/' : '/welcome'} replace />} />
        </Routes>

        {token && role === 'customer' && <BottomNav />}
        {token && role === 'rider'    && <RiderBottomNav />}
        {token && role === 'vendor'   && <VendorBottomNav />}
      </div>
    </BrowserRouter>
  )
}
