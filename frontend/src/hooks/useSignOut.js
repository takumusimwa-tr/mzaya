import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

export default function useSignOut() {
  const navigate = useNavigate()
  const logout = useAuthStore(s => s.logout)
  return useCallback(() => {
    logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])
}
