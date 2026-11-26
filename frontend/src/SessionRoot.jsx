import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import useAuthStore from './store/useAuthStore'

export default function SessionRoot() {
  const identity = useAuthStore(s => s.user && s.token ? `${s.user.id}:${s.user.role}` : 'guest')
  return <SessionQueries key={identity} />
}

function SessionQueries() {
  const [queryClient] = useState(() => new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
}))
  useEffect(() => () => {
    void queryClient.cancelQueries()
    queryClient.clear()
  }, [queryClient])
  return <QueryClientProvider client={queryClient}><App /></QueryClientProvider>
}

