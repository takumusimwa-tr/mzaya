import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { vendorAPI, cityAPI } from '../../api/api'
import useAuthStore from '../../store/useAuthStore'
import Icon from '../../components/ui/Icon'

const CATEGORIES = [
  { id: 'food',      label: 'Food / Restaurant', icon: 'food' },
  { id: 'grocery',   label: 'Grocery / Store',   icon: 'grocery' },
  { id: 'materials', label: 'Building Materials', icon: 'materials' },
]

export default function VendorOnboarding() {
  const navigate = useNavigate()
  const user     = useAuthStore((s) => s.user)
  const setAuth  = useAuthStore((s) => s.setAuth)

  const [form, setForm] = useState({
    name: '', category: 'food', city_id: '', address: '', phone: user?.phone || '', description: '', branch_name: 'Main',
  })
  const [status, setStatus] = useState('') // '', 'submitting', 'pending', 'error'
  const [error, setError]   = useState('')

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn:  () => cityAPI.list().then((r) => r.data.cities),
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async () => {
    setError('')
    if (!form.name.trim()) return setError('Enter your business name')
    if (!form.city_id)     return setError('Select your city')
    if (!form.address.trim()) return setError('Enter your address')
    if (!form.phone.trim())   return setError('Enter a contact phone')

    setStatus('submitting')
    try {
      await vendorAPI.register(form)
      // The user is now a vendor (pending). Refresh their role locally.
      if (user && setAuth) {
        setAuth({ ...user, role: 'vendor' }, useAuthStore.getState().token)
      }
      setStatus('pending')
    } catch (err) {
      setStatus('error')
      setError(err.response?.data?.error || 'Could not submit your application')
    }
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Application submitted</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-sm">
          Your business is pending approval. Our team will review it shortly — you'll be able to
          set up your menu and start receiving orders once approved.
        </p>
        <button onClick={() => navigate('/vendor')}
          className="w-full max-w-xs py-4 rounded-2xl text-white font-bold"
          style={{ background: '#00A651' }}>
          Go to my dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-6 pt-12 pb-6" style={{ background: '#00A651' }}>
        <button onClick={() => navigate(-1)} className="text-white/80 text-sm mb-4">← Back</button>
        <h1 className="text-2xl font-black text-white">Sell on Mzaya</h1>
        <p className="text-white/80 text-sm mt-1">Register your business and start receiving orders.</p>
      </div>

      <div className="px-6 py-6 flex flex-col gap-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
        )}

        {/* Category */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block">What do you sell?</label>
          <div className="flex flex-col gap-2">
            {CATEGORIES.map((c) => (
              <button key={c.id} type="button" onClick={() => set('category', c.id)}
                className="flex items-center gap-3 p-3 rounded-xl border text-left transition-all"
                style={form.category === c.id
                  ? { borderColor: '#00A651', background: '#EDFAF3' }
                  : { borderColor: '#E5E7EB' }
                }>
                <span className="text-xl"><Icon name={c.icon} size={22} /></span>
                <span className="text-sm font-semibold text-gray-800">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Field label="Business name" value={form.name} onChange={(v) => set('name', v)} placeholder="e.g. Chicken Inn" />

        {/* City */}
        <div>
          <label className="text-xs text-gray-500">City</label>
          <select value={form.city_id} onChange={(e) => set('city_id', e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500">
            <option value="">Select city</option>
            {cities?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <Field label="Branch name (optional)" value={form.branch_name} onChange={(v) => set('branch_name', v)} placeholder="e.g. CBD, Borrowdale" />
        <Field label="Address" value={form.address} onChange={(v) => set('address', v)} placeholder="Street address" />
        <Field label="Contact phone" value={form.phone} onChange={(v) => set('phone', v)} placeholder="07X XXX XXXX" />

        <div>
          <label className="text-xs text-gray-500">Description (optional)</label>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2}
            placeholder="Short description customers will see"
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 resize-none" />
        </div>

        <button onClick={submit} disabled={status === 'submitting'}
          className="w-full py-4 rounded-2xl text-white font-bold mt-2 disabled:opacity-60"
          style={{ background: '#00A651' }}>
          {status === 'submitting' ? 'Submitting…' : 'Submit application'}
        </button>
        <p className="text-xs text-gray-400 text-center">
          Your business will be reviewed before going live.
        </p>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500" />
    </div>
  )
}
