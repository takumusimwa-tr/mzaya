import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import useAuthStore from './store/useAuthStore'
import { connectSocket, disconnectSocket } from './realtime/socket'
import LoadingScreen from './components/ui/LoadingScreen'

// ─── Code splitting ───────────────────────────────────────────────────────────
// Every page is lazy-loaded. Before this, a customer opening the app downloaded
// the entire vendor console, the rider app, AND the admin dashboard — code they
// will never run. On Zimbabwean mobile data that's real money spent on the first
// load. Now each role pulls only its own screens, on demand.

// Auth / onboarding
const OnboardingPage = lazy(() => import('./pages/onboarding/OnboardingPage'))
const LoginPage      = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage   = lazy(() => import('./pages/auth/RegisterPage'))

// Customer
const HomePage      = lazy(() => import('./pages/home/HomePage'))
const VendorPage    = lazy(() => import('./pages/home/VendorPage'))
const ErrandPage    = lazy(() => import('./pages/home/ErrandPage'))
const CartPage      = lazy(() => import('./pages/order/CartPage'))
const CheckoutPage  = lazy(() => import('./pages/order/CheckoutPage'))
const OrdersPage    = lazy(() => import('./pages/order/OrdersPage'))
const OrderDetail   = lazy(() => import('./pages/order/OrderDetail'))
const TrackingPage  = lazy(() => import('./pages/tracking/TrackingPage'))
const ProfilePage   = lazy(() => import('./pages/profile/ProfilePage'))
const FavoritesPage = lazy(() => import('./pages/profile/FavoritesPage'))
const AddressesPage = lazy(() => import('./pages/profile/AddressesPage'))

// Rider
const RiderHome        = lazy(() => import('./pages/rider/RiderHome'))
const RiderDelivery    = lazy(() => import('./pages/rider/RiderDelivery'))
const RiderNegotiate   = lazy(() => import('./pages/rider/RiderNegotiate'))
const RiderEarnings    = lazy(() => import('./pages/rider/RiderEarnings'))
const RiderProfilePage = lazy(() => import('./pages/rider/RiderProfilePage'))

// Vendor (tablet console)
const VendorHome       = lazy(() => import('./pages/vendor/VendorHome'))
const VendorOrders     = lazy(() => import('./pages/vendor/VendorOrders'))
const VendorMenu       = lazy(() => import('./pages/vendor/VendorMenu'))
const VendorSettings   = lazy(() => import('./pages/vendor/VendorSettings'))
const VendorAnalytics  = lazy(() => import('./pages/vendor/VendorAnalytics'))
const VendorOnboarding = lazy(() => import('./pages/vendor/VendorOnboarding'))
const VendorAddBranch  = lazy(() => import('./pages/vendor/VendorAddBranch'))

// Admin
const AdminHome = lazy(() => import('./pages/admin/AdminHome'))

// Layout — always needed, so not lazy.
import BottomNav       from './components/layout/BottomNav'
import RiderBottomNav  from './components/layout/RiderBottomNav'
import VendorSideRail  from './components/layout/VendorSideRail'

// ─── Route guards ─────────────────────────────────────────────────────────────

// Signed in?
function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/welcome" replace />
  return children
}

// Signed in AND holding the right role.
//
// Previously every route used ProtectedRoute, which only asked "is there a
// token?" — so a logged-in customer could type /admin and the admin dashboard
// would render. The backend correctly refused the API calls, so no data leaked,
// but the customer got a broken shell of a page they should never see. The UI
// should refuse the navigation too.
function RoleRoute({ allow, children }) {
  const token = useAuthStore((s) => s.token)
  const user  = useAuthStore((s) => s.user)

  if (!token) return <Navigate to="/welcome" replace />
  // Send them to their own home rather than a dead end.
  if (!allow.includes(user?.role)) return <Navigate to="/" replace />
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
          <Suspense fallback={<LoadingScreen message="Loading..." />}>
            <Routes>
              <Route path="/vendor"              element={<RoleRoute allow={['vendor']}><VendorHome /></RoleRoute>} />
              <Route path="/vendor/orders"       element={<RoleRoute allow={['vendor']}><VendorOrders /></RoleRoute>} />
              <Route path="/vendor/menu"         element={<RoleRoute allow={['vendor']}><VendorMenu /></RoleRoute>} />
              <Route path="/vendor/settings"     element={<RoleRoute allow={['vendor']}><VendorSettings /></RoleRoute>} />
              <Route path="/vendor/analytics"    element={<RoleRoute allow={['vendor']}><VendorAnalytics /></RoleRoute>} />
              <Route path="/vendor/branches/new" element={<RoleRoute allow={['vendor']}><VendorAddBranch /></RoleRoute>} />
              <Route path="*" element={<Navigate to="/vendor" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    )
  }

  // Phone-width shell for customer / rider / auth / admin.
  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <Suspense fallback={<LoadingScreen message="Loading..." />}>
        <Routes>
          <Route path="/welcome"  element={<GuestRoute><OnboardingPage /></GuestRoute>} />
          <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          <Route path="/" element={<ProtectedRoute><RootRedirect /></ProtectedRoute>} />

          {/* Customer.
              NOTE: /vendor/:id is the CUSTOMER-facing store page — not the vendor
              console — so it stays open to any signed-in user. The console lives
              at /vendor (no param) and is guarded in the vendor shell above. */}
          <Route path="/home"       element={<RoleRoute allow={['customer']}><HomePage /></RoleRoute>} />
          <Route path="/vendor/:id" element={<ProtectedRoute><VendorPage /></ProtectedRoute>} />
          <Route path="/errand"     element={<RoleRoute allow={['customer']}><ErrandPage /></RoleRoute>} />
          <Route path="/cart"       element={<RoleRoute allow={['customer']}><CartPage /></RoleRoute>} />
          <Route path="/checkout"   element={<RoleRoute allow={['customer']}><CheckoutPage /></RoleRoute>} />
          <Route path="/orders"     element={<RoleRoute allow={['customer']}><OrdersPage /></RoleRoute>} />
          <Route path="/orders/:id" element={<RoleRoute allow={['customer']}><OrderDetail /></RoleRoute>} />
          <Route path="/track/:id"  element={<RoleRoute allow={['customer']}><TrackingPage /></RoleRoute>} />
          <Route path="/favorites"  element={<RoleRoute allow={['customer']}><FavoritesPage /></RoleRoute>} />
          <Route path="/addresses"  element={<RoleRoute allow={['customer']}><AddressesPage /></RoleRoute>} />

          {/* Shared — every role has a profile. */}
          <Route path="/profile"    element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          {/* Any signed-in user can apply to become a vendor. */}
          <Route path="/sell"       element={<ProtectedRoute><VendorOnboarding /></ProtectedRoute>} />

          {/* Rider */}
          <Route path="/rider"              element={<RoleRoute allow={['rider']}><RiderHome /></RoleRoute>} />
          <Route path="/rider/setup"        element={<RoleRoute allow={['rider']}><RiderProfilePage /></RoleRoute>} />
          <Route path="/rider/delivery/:id" element={<RoleRoute allow={['rider']}><RiderDelivery /></RoleRoute>} />
          <Route path="/rider/negotiate"    element={<RoleRoute allow={['rider']}><RiderNegotiate /></RoleRoute>} />
          <Route path="/rider/earnings"     element={<RoleRoute allow={['rider']}><RiderEarnings /></RoleRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<RoleRoute allow={['admin']}><AdminHome /></RoleRoute>} />

          <Route path="*" element={<Navigate to={token ? '/' : '/welcome'} replace />} />
        </Routes>
      </Suspense>

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
