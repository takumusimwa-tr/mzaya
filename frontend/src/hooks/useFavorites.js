import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/api'

// Favourites are on BRANDS ("I like Chicken Inn"), not on a specific branch.
// The nearest branch is resolved when the customer taps through.

// The set of favourited brand IDs + a toggle. Used for heart state on the home page.
export function useFavoriteIds() {
  const queryClient = useQueryClient()

  const { data: ids = [] } = useQuery({
    queryKey: ['favorite-ids'],
    queryFn:  () => api.get('/favorites/ids').then((r) => r.data.ids),
  })

  const toggle = useMutation({
    mutationFn: (brandId) => api.post(`/favorites/${brandId}`).then((r) => r.data),
    onMutate: async (brandId) => {
      // Optimistic update — the heart fills instantly, before the round trip.
      await queryClient.cancelQueries({ queryKey: ['favorite-ids'] })
      const prev = queryClient.getQueryData(['favorite-ids']) || []
      const next = prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
      queryClient.setQueryData(['favorite-ids'], next)
      return { prev }
    },
    onError: (_err, _brandId, ctx) => {
      // Roll the optimistic update back if the server rejected it.
      if (ctx?.prev) queryClient.setQueryData(['favorite-ids'], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-ids'] })
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  return { ids, isFavorite: (id) => ids.includes(id), toggle: toggle.mutate }
}

// The full favourited brand list (for the favourites page).
export function useFavoriteBrands() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn:  () => api.get('/favorites').then((r) => r.data.brands),
  })
}

// Back-compat alias — the page previously imported useFavoriteVendors.
export const useFavoriteVendors = useFavoriteBrands
