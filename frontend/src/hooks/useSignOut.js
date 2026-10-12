import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import useAuthStore from '../store/useAuthStore'
import useCartStore from '../store/useCartStore'
import useActiveBranch from '../store/useActiveBranch'

// Device-local data that belongs to the person who was signed in. Phones are
// shared in many households, so none of it may carry over to the next login.
const PERSONAL_KEYS = ['mzaya_recent_searches']

// The one sign-out every role uses (customer, Mzaya, vendor). logout() alone
// cleared the token and offline caches but left the cart (which the next user
// inherited) and React Query's in-memory data (which briefly showed the next
// user the previous person's orders and saved addresses).
export default function useSignOut() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const logout = useAuthStore((s) => s.logout)
  const clearCart = useCartStore((s) => s.clearCart)
  const clearBranch = useActiveBranch((s) => s.clear)

  return useCallback(() => {
    queryClient.cancelQueries()
    queryClient.clear()
    clearCart()
    clearBranch() // a vendor's selected branch must not carry over to the next vendor
    try { PERSONAL_KEYS.forEach((k) => localStorage.removeItem(k)) } catch { /* storage unavailable */ }
    logout()
    navigate('/login', { replace: true })
  }, [queryClient, clearCart, clearBranch, logout, navigate])
}
