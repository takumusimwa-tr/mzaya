import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/api'

// Returns the set of favorited vendor IDs + a toggle function
export function useFavoriteIds() {
  const queryClient = useQueryClient()

  const { data: ids = [] } = useQuery({
    queryKey: ['favorite-ids'],
    queryFn:  () => api.get('/favorites/ids').then((r) => r.data.ids),
  })

  const toggle = useMutation({
    mutationFn: (vendorId) => api.post(`/favorites/${vendorId}`).then((r) => r.data),
    onMutate: async (vendorId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['favorite-ids'] })
      const prev = queryClient.getQueryData(['favorite-ids']) || []
      const next = prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId]
      queryClient.setQueryData(['favorite-ids'], next)
      return { prev }
    },
    onError: (_err, _vendorId, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['favorite-ids'], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-ids'] })
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  return { ids, isFavorite: (id) => ids.includes(id), toggle: toggle.mutate }
}

// Full favorited vendor list (for the favorites page)
export function useFavoriteVendors() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn:  () => api.get('/favorites').then((r) => r.data.vendors),
  })
}
