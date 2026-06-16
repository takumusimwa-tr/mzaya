import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/useAuthStore'

// Customer pages
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

// Rider pages
import RiderHome     from './pages/rider/RiderHome'
import RiderDelivery from './pages/rider/RiderDelivery'
import RiderEarnings from './pages/rider/RiderEarnings'

// Vendor pages
import VendorHome    from './pages/vendor/VendorHome'
import VendorOrders  from './pages/vendor/VendorOrders'
import VendorMenu    from './pages/vendor/VendorMenu'

// Admin pages
import AdminHome     from './pages/admin/AdminHome'

// Layout
import BottomNav         from './components/layout/BottomNav'
import RiderBottomNav    from './components/layout/RiderBottomNav'
import VendorBottomNav   from './components/layout/VendorBottomNav'

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return children
}

function GuestRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  if (token) return <Navigate to="/" replace />
  return children
}

// Root redirect based on role
function RootRedirect() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'rider')  return <Navigate to="/rider" replace />
  if (user.role === 'vendor') return <Navigate to="/vendor" replace />
  if (user.role === 'admin')  return <Navigate to="/admin" replace />
  return <Navigate to="/home" replace />
}

export default function App() {
  const user  = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const role  = user?.role

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
        <Routes>
          {/* Auth */}
          <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          {/* Root — redirect by role */}
          <Route path="/" element={<ProtectedRoute><RootRedirect /></ProtectedRoute>} />

          {/* ── Customer routes ── */}
          <Route path="/home"          element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/vendor/:id"    element={<ProtectedRoute><VendorPage /></ProtectedRoute>} />
          <Route path="/errand"        element={<ProtectedRoute><ErrandPage /></ProtectedRoute>} />
          <Route path="/cart"          element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout"      element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders"        element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/orders/:id"    element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/track/:id"     element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
          <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* ── Rider routes ── */}
          <Route path="/rider"              element={<ProtectedRoute><RiderHome /></ProtectedRoute>} />
          <Route path="/rider/delivery/:id" element={<ProtectedRoute><RiderDelivery /></ProtectedRoute>} />
          <Route path="/rider/earnings"     element={<ProtectedRoute><RiderEarnings /></ProtectedRoute>} />

          {/* ── Vendor routes ── */}
          <Route path="/vendor"        element={<ProtectedRoute><VendorHome /></ProtectedRoute>} />
          <Route path="/vendor/orders" element={<ProtectedRoute><VendorOrders /></ProtectedRoute>} />
          <Route path="/vendor/menu"   element={<ProtectedRoute><VendorMenu /></ProtectedRoute>} />

          {/* ── Admin routes ── */}
          <Route path="/admin"         element={<ProtectedRoute><AdminHome /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Role-based bottom nav */}
        {token && role === 'customer' && <BottomNav />}
        {token && role === 'rider'    && <RiderBottomNav />}
        {token && role === 'vendor'   && <VendorBottomNav />}
      </div>
    </BrowserRouter>
  )
}
