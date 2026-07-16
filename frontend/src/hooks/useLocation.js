import { useState, useEffect } from 'react'

// Real city IDs from the database
const CITIES = [
  { id: 'd7e5b342-5ee8-4e40-9c1f-1024ec0007a2', name: 'Harare',   slug: 'harare',   lat: -17.8252, lng: 31.0335 },
  { id: '33d3b120-9bd8-4d66-8819-bbc9a706634d', name: 'Bulawayo', slug: 'bulawayo', lat: -20.1325, lng: 28.6261 },
  { id: 'db158d68-fd21-4136-ae0e-8708795a6e17', name: 'Mutare',   slug: 'mutare',   lat: -18.9707, lng: 32.6709 },
]

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getNearestCity(lat, lng) {
  return CITIES.reduce((nearest, city) => {
    const dist = haversineDistance(lat, lng, city.lat, city.lng)
    return dist < nearest.dist ? { ...city, dist } : nearest
  }, { dist: Infinity })
}

export default function useLocation() {
  const [city,    setCity]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [coords,  setCoords]  = useState(null)

  useEffect(() => {
    // Geolocation is an async external system — syncing its result into state is
    // exactly what an effect is for.
    if (!navigator.geolocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCity(CITIES[0])
      setError('Geolocation not supported')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ lat: latitude, lng: longitude })
        setCity(getNearestCity(latitude, longitude))
        setLoading(false)
      },
      () => {
        setCity(CITIES[0])
        setError('Location access denied — defaulting to Harare')
        setLoading(false)
      },
      { timeout: 5000, maximumAge: 300000 }
    )
  }, [])

  return { city, loading, error, coords, cities: CITIES }
}
