import { useEffect, useRef } from 'react'
import api from '../api/api'

// Broadcasts the rider's GPS location while active.
// Call with `active=true` when on a delivery.
export default function useRiderTracking(active) {
  const watchId = useRef(null)

  useEffect(() => {
    if (!active || !navigator.geolocation) return

    // Send location immediately, then watch for changes
    const send = (pos) => {
      const { latitude, longitude } = pos.coords
      api.patch('/riders/location', { lat: latitude, lng: longitude })
        .catch((err) => console.log('Location update failed:', err.message))
    }

    // Get initial position
    navigator.geolocation.getCurrentPosition(send, null, { enableHighAccuracy: true })

    // Watch position continuously
    watchId.current = navigator.geolocation.watchPosition(
      send,
      (err) => console.log('GPS error:', err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )

    return () => {
      if (watchId.current != null) {
        navigator.geolocation.clearWatch(watchId.current)
      }
    }
  }, [active])
}
