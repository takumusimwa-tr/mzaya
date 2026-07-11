import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { vendorAPI, cityAPI } from '../../api/api'
import Icon from '../../components/ui/Icon'

export default function VendorAddBranch() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ branch_name: '', city_id: '', address: '', phone: '' })
  const [status, setStatus] = useState('')
  const [error, setError]   = useState('')

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn:  () => cityAPI.list().then((r) => r.data.cities),
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async () => {
    setError('')
    if (!form.branch_name.trim()) return setError('Enter a branch name')
    if (!form.city_id)            return setError('Select a city')
    if (!form.address.trim())     return setError('Enter the address')
    if (!form.phone.trim())       return setError('Enter a contact phone')

    setStatus('submitting')
    try {
      await vendorAPI.addBranch(form)
      queryClient.invalidateQueries(['my-branches'])
      setStatus('done')
    } catch (err) {
      setStatus('')
      setError(err.response?.data?.error || 'Could not add branch')
    }
  }

  if (status === 'done') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 text-center">
        <div className="mb-4 flex justify-center" style={{ color: '#00A651' }}><Icon name="store" size={56} /></div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Branch added</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-sm">
          Your new branch is pending approval. Once approved it'll appear in your branch switcher
          and start receiving orders in its city.
        </p>
        <button onClick={() => navigate('/vendor')}
          className="w-full max-w-xs py-4 rounded-2xl text-white font-bold" style={{ background: '#00A651' }}>
          Back to dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-12 pb-6" style={{ background: '#00A651' }}>
        <button onClick={() => navigate(-1)} className="text-white/80 text-sm mb-4">← Back</button>
        <h1 className="text-2xl font-black text-white">Add a branch</h1>
        <p className="text-white/80 text-sm mt-1">A new location under your existing brand.</p>
      </div>

      <div className="w-full px-8 py-6 flex flex-col gap-4">
        {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>}

        <Field label="Branch name" value={form.branch_name} onChange={(v) => set('branch_name', v)} placeholder="e.g. Borrowdale, Bulawayo" />

        <div>
          <label className="text-xs text-gray-500">City</label>
          <select value={form.city_id} onChange={(e) => set('city_id', e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500">
            <option value="">Select city</option>
            {cities?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <Field label="Address" value={form.address} onChange={(v) => set('address', v)} placeholder="Street address" />
        <Field label="Contact phone" value={form.phone} onChange={(v) => set('phone', v)} placeholder="07X XXX XXXX" />

        <button onClick={submit} disabled={status === 'submitting'}
          className="w-full py-4 rounded-2xl text-white font-bold mt-2 disabled:opacity-60" style={{ background: '#00A651' }}>
          {status === 'submitting' ? 'Adding…' : 'Add branch'}
        </button>
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
