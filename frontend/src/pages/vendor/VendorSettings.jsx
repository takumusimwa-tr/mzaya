import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/api'
import useActiveBranch from '../../store/useActiveBranch'
import ImageUpload from '../../components/ImageUpload'
import LoadingScreen from '../../components/ui/LoadingScreen'

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

const DEFAULT_HOURS = { open: '08:00', close: '22:00', closed: false }

export default function VendorSettings() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const branchId = useActiveBranch((s) => s.branchId)
  const [form, setForm]   = useState(null)
  const [hours, setHours] = useState({})
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['my-vendor', branchId],
    queryFn:  () => api.get('/vendors/my', { params: branchId ? { branch_id: branchId } : {} }).then((r) => r.data.vendor),
  })

  useEffect(() => {
    if (!vendor) return
    setForm({
      name:        vendor.name || '',
      description: vendor.description || '',
      phone:       vendor.phone || '',
      address:     vendor.address || '',
      logo_url:    vendor.logo_url || null,
      cover_url:   vendor.cover_url || null,
    })
    // Seed hours from stored opening_hours, filling missing days with defaults.
    const seeded = {}
    for (const d of DAYS) {
      seeded[d.key] = vendor.opening_hours?.[d.key] || { ...DEFAULT_HOURS }
    }
    setHours(seeded)
  }, [vendor])

  const saveMut = useMutation({
    mutationFn: (patch) => api.put(`/vendors/${vendor.id}`, patch),
    onSuccess: () => {
      setSaved(true)
      queryClient.invalidateQueries(['my-vendor'])
      setTimeout(() => setSaved(false), 2000)
    },
    onError: (err) => setError(err.response?.data?.error || 'Could not save'),
  })

  const save = () => {
    setError('')
    if (!form.name.trim()) { setError('Business name is required'); return }
    saveMut.mutate({ ...form, opening_hours: hours })
  }

  const setDay = (key, patch) => {
    setHours((h) => ({ ...h, [key]: { ...h[key], ...patch } }))
  }

  if (isLoading || !form) return <LoadingScreen message="Loading settings..." />

  return (
    <div className="h-screen overflow-y-auto bg-gray-50">
      <div className="w-full px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-900">Business settings</h1>
          {saved && <span className="text-sm font-semibold text-green-600">Saved ✓</span>}
        </div>

        {/* Branches — always-visible entry to add another location */}
        <div className="mb-6 p-4 rounded-2xl border border-gray-100 bg-white flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-800 text-sm">Branches</p>
            <p className="text-xs text-gray-400 mt-0.5">Add another location under your brand</p>
          </div>
          <button onClick={() => navigate('/vendor/branches/new')}
            className="px-4 py-2 rounded-xl text-white text-sm font-semibold active:scale-95 transition-transform"
            style={{ background: '#00A651' }}>
            + Add branch
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
        )}

        {/* Cover + logo */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-5">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Branding</h2>
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Cover image</p>
            <ImageUpload
              currentUrl={form.cover_url}
              onUploaded={(url) => setForm((f) => ({ ...f, cover_url: url }))}
              label="Upload cover"
              shape="wide"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Logo</p>
            <div className="max-w-[160px]">
              <ImageUpload
                currentUrl={form.logo_url}
                onUploaded={(url) => setForm((f) => ({ ...f, logo_url: url }))}
                label="Upload logo"
                shape="circle"
              />
            </div>
          </div>
        </div>

        {/* Business info */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-5">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Business details</h2>
          <div className="flex flex-col gap-3">
            <Field label="Business name" value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
            <div>
              <label className="text-xs text-gray-500">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="Short description customers will see"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))} placeholder="07X XXX XXXX" />
              <Field label="Address" value={form.address}
                onChange={(v) => setForm((f) => ({ ...f, address: v }))} />
            </div>
          </div>
        </div>

        {/* Opening hours */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-5">
          <h2 className="text-sm font-bold text-gray-700 mb-1">Opening hours</h2>
          <p className="text-xs text-gray-400 mb-3">
            Your store opens and closes automatically based on these hours. Use “Pause orders” on your home screen to close early.
          </p>
          <div className="flex flex-col gap-2">
            {DAYS.map((d) => {
              const h = hours[d.key] || DEFAULT_HOURS
              return (
                <div key={d.key} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-gray-700">{d.label}</span>
                  {h.closed ? (
                    <span className="flex-1 text-sm text-gray-400">Closed</span>
                  ) : (
                    <div className="flex-1 flex items-center gap-2">
                      <input type="time" value={h.open}
                        onChange={(e) => setDay(d.key, { open: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-green-500" />
                      <span className="text-gray-400 text-sm">to</span>
                      <input type="time" value={h.close}
                        onChange={(e) => setDay(d.key, { close: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-green-500" />
                    </div>
                  )}
                  <button onClick={() => setDay(d.key, { closed: !h.closed })}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={h.closed
                      ? { background: '#EDFAF3', color: '#00A651' }
                      : { background: '#F3F4F6', color: '#6B7280' }
                    }>
                    {h.closed ? 'Set open' : 'Mark closed'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <button onClick={save} disabled={saveMut.isPending}
          className="w-full py-4 rounded-2xl text-white font-bold active:scale-98 transition-transform disabled:opacity-60"
          style={{ background: '#00A651' }}>
          {saveMut.isPending ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500"
      />
    </div>
  )
}
