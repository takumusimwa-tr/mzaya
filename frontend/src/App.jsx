import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/useAuthStore'

// Pages
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

// Layout
import BottomNav     from './components/layout/BottomNav'

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

export default function App() {
  const token = useAuthStore((s) => s.token)

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
        <Routes>
          {/* Guest routes */}
          <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          {/* Protected routes */}
          <Route path="/"              element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/vendor/:id"    element={<ProtectedRoute><VendorPage /></ProtectedRoute>} />
          <Route path="/errand"        element={<ProtectedRoute><ErrandPage /></ProtectedRoute>} />
          <Route path="/cart"          element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout"      element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders"        element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/orders/:id"    element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/track/:id"     element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
          <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
        </Routes>

        {/* Bottom nav only shown when logged in */}
        {token && <BottomNav />}
      </div>
    </BrowserRouter>
  )
}
