import { useState, useEffect } from 'react'
import api from '../api/api'

// Fallback coordinates only — used when the cities API is unreachable, so the UI
// can still show a sensible city name. Deliberately NO ids here: the previous
// version hardcoded UUIDs copied from one developer database, and any other
// environment (staging, a teammate's machine) has different ids — so every browse
// query silently filtered by a city that didn't exist and returned nothing.
// Real ids must always come from GET /api/cities.
const FALLBACK_CITIES = [
  { id: null, name: 'Harare',   slug: 'harare',   lat: -17.8252, lng: 31.0335 },
  { id: null, name: 'Bulawayo', slug: 'bulawayo', lat: -20.1325, lng: 28.6261 },
  { id: null, name: 'Mutare',   slug: 'mutare',   lat: -18.9707, lng: 32.6709 },
]

// Module-level cache: fetch the city list once per session, not once per mount.
let cityCache = null

async function loadCities() {
  if (cityCache) return cityCache
  try {
    const { data } = await api.get('/cities')
    const rows = data.cities || []
    if (rows.length) {
      cityCache = rows.map((c) => ({
        id:   c.id,
        name: c.name,
        slug: c.slug,
        lat:  c.center?.lat ?? 0,
        lng:  c.center?.lng ?? 0,
      }))
      return cityCache
    }
  } catch { /* network/API down — fall through */ }
  return FALLBACK_CITIES
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getNearestCity(cities, lat, lng) {
  return cities.reduce((nearest, city) => {
    const dist = haversineDistance(lat, lng, city.lat, city.lng)
    return dist < nearest.dist ? { ...city, dist } : nearest
  }, { ...cities[0], dist: Infinity })
}

export default function useLocation() {
  const [city,    setCity]    = useState(null)
  const [cities,  setCities]  = useState(FALLBACK_CITIES)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [coords,  setCoords]  = useState(null)

  useEffect(() => {
    let cancelled = false

    // Two async external systems — the cities API and device geolocation — are
    // synced into state here, which is exactly what an effect is for.
    ;(async () => {
      const list = await loadCities()
      if (cancelled) return
      setCities(list)

      const fallbackToDefault = (msg) => {
        setCity(list[0])
        setError(msg)
        setLoading(false)
      }

      if (!navigator.geolocation) {
        fallbackToDefault('Geolocation not supported')
        return
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return
          const { latitude, longitude } = pos.coords
          setCoords({ lat: latitude, lng: longitude })
          setCity(getNearestCity(list, latitude, longitude))
          setLoading(false)
        },
        () => {
          if (cancelled) return
          fallbackToDefault('Location access denied — defaulting to Harare')
        },
        { timeout: 5000, maximumAge: 300000 }
      )
    })()

    return () => { cancelled = true }
  }, [])

  return { city, loading, error, coords, cities }
}
