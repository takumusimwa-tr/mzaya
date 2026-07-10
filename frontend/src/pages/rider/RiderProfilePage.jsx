import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { riderAPI, vehicleAPI, cityAPI } from '../../api/api'

export default function RiderProfilePage() {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const [vehicleType, setVehicleType] = useState('')
  const [cityId, setCityId]           = useState('')
  const [plate, setPlate]             = useState('')
  const [model, setModel]             = useState('')
  const [nationalId, setNationalId]   = useState('')
  const [error, setError]             = useState('')
  const [saved, setSaved]             = useState(false)

  // Vehicle spectrum from backend (single source of truth)
  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn:  () => vehicleAPI.list().then((r) => r.data.vehicles),
  })

  // Cities list
  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn:  () => cityAPI.list().then((r) => r.data.cities || r.data),
  })

  // Existing profile (prefill if the rider already set up)
  const { data: profile } = useQuery({
    queryKey: ['rider-profile'],
    queryFn:  () => riderAPI.getProfile().then((r) => r.data.rider),
    retry: false,
  })

  useEffect(() => {
    if (profile) {
      setVehicleType(profile.vehicle_type || '')
      setCityId(profile.city_id || '')
      setPlate(profile.vehicle_plate || '')
      setModel(profile.vehicle_model || '')
      setNationalId(profile.national_id || '')
    }
  }, [profile])

  const saveMut = useMutation({
    mutationFn: () => riderAPI.saveProfile({
      vehicle_type:  vehicleType,
      city_id:       cityId,
      vehicle_plate: plate || null,
      vehicle_model: model || null,
      national_id:   nationalId || null,
    }),
    onSuccess: () => {
      setSaved(true)
      queryClient.invalidateQueries({ queryKey: ['rider-profile'] })
      setTimeout(() => navigate('/rider'), 900)
    },
    onError: (err) => setError(err.response?.data?.error || 'Could not save profile'),
  })

  const handleSave = () => {
    setError('')
    if (!vehicleType) { setError('Please select your vehicle'); return }
    if (!cityId)      { setError('Please select your city'); return }
    saveMut.mutate()
  }

  const selectedVehicle = vehicles?.find((v) => v.value === vehicleType)

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-16 pb-8" style={{ background: '#00A651' }}>
        <button onClick={() => navigate(-1)} className="bg-white/10 p-2 rounded-full mb-4 inline-block">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-white">Rider setup</h1>
        <p className="text-white/60 mt-1 text-sm">
          Set your vehicle and city so we can match you with the right deliveries.
        </p>
      </div>

      <div className="px-6 pt-6 pb-6 flex flex-col gap-5 flex-1 overflow-y-auto">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {saved && (
          <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
            <p className="text-sm text-green-700">Profile saved ✓</p>
          </div>
        )}

        {/* Vehicle */}
        <div>
          <label className="text-sm font-semibold text-gray-800">Your vehicle <span className="text-red-500">*</span></label>
          <p className="text-xs text-gray-400 mb-3">Bigger vehicles can take smaller deliveries too.</p>
          <div className="flex flex-col gap-2">
            {vehicles?.map((v) => (
              <button
                key={v.value}
                type="button"
                onClick={() => setVehicleType(v.value)}
                className="flex items-center justify-between p-3 rounded-xl border text-left transition-all"
                style={vehicleType === v.value
                  ? { borderColor: '#00A651', background: '#EDFAF3' }
                  : { borderColor: '#E5E5E5' }
                }
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{v.name}</p>
                  <p className="text-xs text-gray-400">{v.hint}</p>
                </div>
                {vehicleType === v.value && (
                  <span className="text-green-600 text-lg">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* City */}
        <div>
          <label className="text-sm font-semibold text-gray-800">Your city <span className="text-red-500">*</span></label>
          <div className="flex gap-2 mt-3">
            {cities?.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCityId(c.id)}
                className="flex-1 py-3 rounded-xl border text-sm font-semibold transition-all"
                style={cityId === c.id
                  ? { borderColor: '#00A651', background: '#EDFAF3', color: '#00A651' }
                  : { borderColor: '#E5E5E5', color: '#444' }
                }
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Optional details */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-500">Vehicle plate (optional)</label>
            <input
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="e.g. ABC 1234"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Vehicle model (optional)</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Toyota Hilux, Honda CB125"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">National ID (optional)</label>
            <input
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="e.g. 63-1234567 A 00"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500"
            />
          </div>
        </div>

        {selectedVehicle && (
          <p className="text-xs text-gray-400">
            You'll be matched with deliveries suited to a {selectedVehicle.name.toLowerCase()} and anything lighter.
          </p>
        )}
      </div>

      {/* Save — static footer, always visible below the scroll area */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white">
        <button
          onClick={handleSave}
          disabled={saveMut.isPending}
          className="w-full py-4 rounded-2xl text-white font-bold active:scale-98 transition-transform disabled:opacity-70"
          style={{ background: '#00A651' }}
        >
          {saveMut.isPending ? 'Saving…' : 'Save & continue'}
        </button>
      </div>
    </div>
  )
}
