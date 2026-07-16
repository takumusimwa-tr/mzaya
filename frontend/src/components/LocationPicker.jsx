import { useState } from 'react'
import { geoAPI } from '../api/api'
import Icon from './ui/Icon'

// Capturing a location in Zimbabwe.
//
// Street addresses here are unreliable: many places have no number, road names
// repeat across suburbs, and half of Harare navigates by landmark ("opposite the
// Total garage, blue gate"). Asking someone to type "15 Borrowdale Rd" the way a
// Western app would produces an address a Mzaya then has to phone about.
//
// So we ask three ways, in descending order of reliability:
//
//   1. GPS       — one tap, exact coordinates. Best when you're standing there.
//   2. Pin paste — a WhatsApp/Maps pin link. This is how Zimbabweans ALREADY
//                  share locations with each other, every day.
//   3. WhatsApp  — can't do either? Open WhatsApp and ask the person at the other
//                  end to send their pin.
//
// Plus a free-text landmark, because coordinates get you to the gate and a
// landmark gets you through it.
//
// Extracted from CheckoutPage so the errand flow uses the identical thing rather
// than a second, subtly different implementation.
export default function LocationPicker({
  coords,
  onCoords,
  landmark,
  onLandmark,
  label = 'Pin the exact location (optional)',
  landmarkLabel = 'Landmark / directions (optional)',
  landmarkPlaceholder = 'e.g. blue gate opposite Total garage, ask for tuckshop',
  whatsappMessage,
}) {
  const [pinLink, setPinLink]   = useState('')
  const [status, setStatus]     = useState('')   // '' | loading | ok | error
  const [error, setError]       = useState('')

  const resolvePin = async (link) => {
    const value = (link ?? pinLink).trim()
    if (!value) return
    setStatus('loading'); setError('')
    try {
      const { data } = await geoAPI.resolvePin(value)
      onCoords({ lat: data.lat, lng: data.lng })
      setStatus('ok')
      if (data.warn) setError(data.warn)
    } catch (err) {
      onCoords(null)
      setStatus('error')
      setError(err.response?.data?.error || "Couldn't read that location link")
    }
  }

  // Auto-resolve the moment a link is pasted — no extra tap.
  const onPinPaste = (value) => {
    setPinLink(value)
    setStatus(''); setError('')
    onCoords(null)
    const looksLikeLink = /https?:\/\/|maps\.|goo\.gl|-?\d+\.\d+,\s*-?\d+\.\d+/i.test(value)
    if (looksLikeLink && value.trim().length > 8) resolvePin(value)
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatus('error')
      setError('Your device does not support location. Paste a pin instead.')
      return
    }
    setStatus('loading'); setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('ok')
        setPinLink('')
      },
      () => {
        setStatus('error')
        setError('Location access denied. Paste a shared pin or type the address.')
      },
      { timeout: 8000, enableHighAccuracy: true, maximumAge: 60000 }
    )
  }

  // Open WhatsApp so the customer can ask whoever is at the other end for a pin.
  const requestViaWhatsApp = () => {
    const msg = encodeURIComponent(
      whatsappMessage ||
      'Hi! Please share your location pin so I can send your Mzaya. ' +
      'Tap the 📎 (attach) → Location → Send your current location, then send me the link.'
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener,noreferrer')
  }

  const clearPin = () => {
    onCoords(null)
    setPinLink('')
    setStatus('')
    setError('')
  }

  return (
    <>
      <label className="text-xs text-gray-500">{label}</label>

      {status === 'ok' && coords ? (
        <div className="flex items-center justify-between mt-1 mb-2 px-4 py-3 rounded-xl"
          style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <div className="flex items-center gap-2">
            <Icon name="location" size={16} />
            <span className="text-sm font-semibold" style={{ color: '#16A34A' }}>Location pinned</span>
            <span className="text-xs" style={{ color: '#15803D' }}>
              ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
            </span>
          </div>
          <button type="button" onClick={clearPin} className="text-xs font-semibold" style={{ color: '#DC2626' }}>
            Change
          </button>
        </div>
      ) : (
        <>
          <button type="button" onClick={useCurrentLocation}
            disabled={status === 'loading'}
            className="w-full flex items-center justify-center gap-2 mt-1 mb-2 px-4 py-3 rounded-xl text-sm font-semibold text-white active:scale-98 transition-transform disabled:opacity-60"
            style={{ background: '#00A651' }}>
            <Icon name="location" size={16} />
            {status === 'loading' ? 'Getting location…' : 'Use my current location'}
          </button>

          <input
            type="text"
            value={pinLink}
            onChange={(e) => onPinPaste(e.target.value)}
            placeholder="or paste a shared WhatsApp / Maps pin link"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500"
          />

          <button type="button" onClick={requestViaWhatsApp}
            className="w-full flex items-center justify-center gap-2 mt-2 mb-2 px-4 py-2.5 rounded-xl text-sm font-semibold active:scale-98 transition-transform"
            style={{ background: '#F0FDF4', color: '#128C7E', border: '1px solid #A7F3D0' }}>
            <Icon name="chat" size={16} />
            Request location via WhatsApp
          </button>
        </>
      )}

      {status === 'error' && <p className="text-xs mb-2 text-red-500">{error}</p>}
      {status === 'ok' && error && <p className="text-xs mb-2" style={{ color: '#B45309' }}>{error}</p>}

      {/* A landmark gets the Mzaya through the gate that coordinates only get them to. */}
      <label className="text-xs text-gray-500 block mt-1">{landmarkLabel}</label>
      <input
        type="text"
        value={landmark}
        onChange={(e) => onLandmark(e.target.value)}
        placeholder={landmarkPlaceholder}
        className="w-full mt-1 mb-3 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500"
      />
    </>
  )
}
