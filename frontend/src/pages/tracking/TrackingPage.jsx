import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { orderAPI } from '../../api/api'
import api from '../../api/api'
import Badge from '../../components/ui/Badge'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Icon from '../../components/ui/Icon'

const STATUS_INFO = {
  pending:   { label: 'Finding a Mzaya',  icon: 'searching', desc: 'Looking for an available Mzaya',  eta: '5-10 min'  },
  accepted:  { label: 'Mzaya on the way', icon: 'rider', desc: 'Heading to the pickup',           eta: '10-15 min' },
  picked_up: { label: 'Order picked up',  icon: 'parcel', desc: 'Your order has been collected',    eta: '10-20 min' },
  en_route:  { label: 'On the way',       icon: 'enroute', desc: 'Heading to you now',               eta: '5-10 min'  },
  delivered: { label: 'Delivered',        icon: 'delivered', desc: 'Enjoy!',                           eta: null        },
  cancelled: { label: 'Cancelled',        icon: 'cancelled', desc: 'This order was cancelled',         eta: null        },
}

const STATUS_STEPS = ['pending', 'accepted', 'picked_up', 'en_route', 'delivered']

export default function TrackingPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const mapRef    = useRef(null)
  const mapObj    = useRef(null)
  const riderMarker = useRef(null)
  const [mapReady, setMapReady] = useState(false)

  const { data: order, isLoading } = useQuery({
    queryKey: ['track', id],
    queryFn:  () => orderAPI.getOrder(id).then((r) => r.data.order),
    refetchInterval: 10000,
  })

  // Poll rider location
  const { data: riderLoc } = useQuery({
    queryKey: ['rider-location', id],
    queryFn:  () => api.get(`/riders/location/${id}`).then((r) => r.data.location),
    refetchInterval: 8000,
    enabled:  !!order && ['accepted', 'picked_up', 'en_route'].includes(order.status),
  })

  // Load Leaflet from CDN
  useEffect(() => {
    if (window.L) { setMapReady(true); return }

    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(css)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setMapReady(true)
    document.body.appendChild(script)
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapReady || !mapRef.current || mapObj.current) return
    const L = window.L

    // Default center: Harare
    const center = riderLoc ? [riderLoc.lat, riderLoc.lng] : [-17.8252, 31.0335]
    mapObj.current = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView(center, 14)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(mapObj.current)
  }, [mapReady, riderLoc])

  // Update rider marker
  useEffect(() => {
    if (!mapObj.current || !riderLoc || !window.L) return
    const L = window.L
    const pos = [riderLoc.lat, riderLoc.lng]

    if (!riderMarker.current) {
      const icon = L.divIcon({
        html: '<div style="width:30px;height:30px;border-radius:50%;background:#00A651;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.3)"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg></div>',
        className: 'rider-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })
      riderMarker.current = L.marker(pos, { icon }).addTo(mapObj.current)
    } else {
      riderMarker.current.setLatLng(pos)
    }
    mapObj.current.panTo(pos)
  }, [riderLoc])

  if (isLoading) return <LoadingScreen message="Loading tracking..." />
  if (!order)    return <div className="p-6 text-center text-gray-500">Order not found</div>

  const info        = STATUS_INFO[order.status] || STATUS_INFO.pending
  const stepIdx     = STATUS_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'
  const isActive    = ['accepted', 'picked_up', 'en_route'].includes(order.status)

  return (
    <div className="min-h-screen pb-8" style={{ background: '#F8F8F8' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-100">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Track order</h1>
          <p className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      {/* Live map */}
      <div className="relative h-64 bg-gray-200">
        {isActive ? (
          <>
            <div ref={mapRef} className="w-full h-full" style={{ zIndex: 1 }} />
            {!riderLoc && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
                <div className="text-center">
                  <div className="mb-2 flex justify-center animate-pulse text-gray-400"><Icon name="location" size={30} /></div>
                  <p className="text-sm text-gray-500">Waiting for Mzaya location...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FFE8E3, #FFD0C7)' }}>
            <div className="text-center">
              <div className="mb-2 flex justify-center"><Icon name={info.icon} size={40} /></div>
              <p className="text-sm font-medium text-gray-600">{info.label}</p>
            </div>
          </div>
        )}
      </div>

      {/* Status card */}
      <div className="mx-4 -mt-6 bg-white rounded-2xl shadow-md p-5 relative z-20">
        <div className="flex items-center gap-4 mb-4">
          <Icon name={info.icon} size={36} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-900">{info.label}</p>
              <Badge label={order.status.replace('_', ' ')} type={order.status} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{info.desc}</p>
          </div>
        </div>

        {info.eta && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 flex items-center justify-between mb-4">
            <span className="text-sm text-red-700 font-medium">Estimated arrival</span>
            <span className="text-sm font-bold text-red-700">{info.eta}</span>
          </div>
        )}

        {!isCancelled && (
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${i <= stepIdx ? 'bg-red-500' : 'bg-gray-200'}`} />
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 ${i < stepIdx ? 'bg-red-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Addresses */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex gap-3 mb-3">
          <span className="text-green-500 mt-0.5">↑</span>
          <div>
            <p className="text-xs text-gray-400">Pickup</p>
            <p className="text-sm text-gray-800">{order.pickup_address}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="text-red-500 mt-0.5">↓</span>
          <div>
            <p className="text-xs text-gray-400">Delivery</p>
            <p className="text-sm text-gray-800">{order.dropoff_address}</p>
          </div>
        </div>
      </div>

      {isActive && (
        <p className="text-center text-xs text-gray-400 mt-4">Live location updates every 8 seconds</p>
      )}
    </div>
  )
}
