import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adCampaignAPI } from '../../api/api'
import api from '../../api/api'
import CampaignMetrics from '../../components/advertising/CampaignMetrics'

const initial = { brand_id: '', city_id: '', category: 'food', title: '', description: '', image_url: '', cta: 'Explore vendor', starts_at: '', ends_at: '' }
const fieldClass = 'w-full rounded-xl border border-[#CBDCD3] bg-white px-3 py-2 text-sm text-[#123E33] focus:outline-none focus:ring-2 focus:ring-[#087B60]'
export default function VendorCampaigns() {
  const qc = useQueryClient()
  const [form, setForm] = useState(initial)
  const [message, setMessage] = useState('')
  const { data, isLoading, error } = useQuery({ queryKey: ['vendor-ad-campaigns'], queryFn: () => adCampaignAPI.mine().then(r => r.data) })
  const { data: vendorData } = useQuery({ queryKey: ['vendor-campaign-branches'], queryFn: () => api.get('/vendors/my/branches').then(r => r.data) })
  const create = useMutation({ mutationFn: adCampaignAPI.createMine, onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendor-ad-campaigns'] }); setForm(initial); setMessage('Draft created. Submit it for review when ready.') }, onError: e => setMessage(e.response?.data?.error || 'Could not create campaign') })
  const submit = useMutation({ mutationFn: adCampaignAPI.submitMine, onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendor-ad-campaigns'] }); setMessage('Submitted for admin review.') }, onError: e => setMessage(e.response?.data?.error || 'Could not submit campaign') })
  const brands = data?.brands || []
  const branches = Array.isArray(vendorData) ? vendorData : Array.isArray(vendorData?.branches) ? vendorData.branches : []
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const handleCreate = (event) => { event.preventDefault(); setMessage(''); create.mutate({ ...form, starts_at: new Date(form.starts_at).toISOString(), ends_at: new Date(form.ends_at).toISOString() }) }
  return <div className="h-full overflow-y-auto bg-[#F7FAF8] px-5 py-8 md:px-10">
    <div className="mx-auto max-w-5xl space-y-6">
      <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#087B60]">Mzaya for vendors</p><h1 className="mt-2 text-3xl font-bold text-[#123E33]">Advertising campaigns</h1><p className="mt-2 text-sm text-[#5B7169]">Create a storefront promotion. Every campaign requires Mzaya approval before customers see it.</p></div>
      {message && <p role="status" className="rounded-xl border border-[#CBDCD3] bg-white p-3 text-sm">{message}</p>}
      <form onSubmit={handleCreate} className="rounded-2xl border border-[#E1EBE5] bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-[#123E33]">New campaign</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">Brand<select className={fieldClass} required value={form.brand_id} onChange={e => update('brand_id', e.target.value)}><option value="">Select your brand</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name || b.id}</option>)}</select></label>
          <label className="text-sm font-medium">City / branch<select className={fieldClass} required value={form.city_id} onChange={e => update('city_id', e.target.value)}><option value="">Select city</option>{[...new Map(branches.filter(b => b.city_id && (!form.brand_id || b.brand_id === form.brand_id)).map(b => [b.city_id,b])).values()].map(b => <option key={b.city_id} value={b.city_id}>{b.city?.name || b.branch_name || b.name || b.city_id}</option>)}</select></label>
          <label className="text-sm font-medium">Category<select className={fieldClass} value={form.category} onChange={e => update('category', e.target.value)}><option value="food">Food</option><option value="grocery">Grocery</option><option value="materials">Hardware & materials</option></select></label>
          <label className="text-sm font-medium">Campaign title<input className={fieldClass} maxLength={100} required value={form.title} onChange={e => update('title', e.target.value)} /></label>
          <label className="text-sm font-medium">Start date<input className={fieldClass} type="datetime-local" required value={form.starts_at} onChange={e => update('starts_at', e.target.value)} /></label>
          <label className="text-sm font-medium">End date<input className={fieldClass} type="datetime-local" required min={form.starts_at || undefined} value={form.ends_at} onChange={e => update('ends_at', e.target.value)} /></label>
          <label className="text-sm font-medium md:col-span-2">Image URL (HTTPS)<input className={fieldClass} type="url" placeholder="https://..." value={form.image_url} onChange={e => update('image_url', e.target.value)} /></label>
          <label className="text-sm font-medium md:col-span-2">Description<textarea className={fieldClass} maxLength={240} rows={2} value={form.description} onChange={e => update('description', e.target.value)} /></label>
        </div><button disabled={create.isPending || !brands.length} className="rounded-full bg-[#087B60] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{create.isPending ? 'Saving…' : 'Save draft'}</button>
      </form>
      <CampaignMetrics />
      <section className="space-y-3"><h2 className="text-lg font-bold text-[#123E33]">Your campaigns</h2>{isLoading && <p>Loading campaigns…</p>}{error && <p role="alert">Could not load campaigns.</p>}{!isLoading && !data?.campaigns?.length && <p className="text-sm text-[#5B7169]">No campaigns yet.</p>}{data?.campaigns?.map(c => <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E1EBE5] bg-white p-4"><div><p className="font-semibold text-[#123E33]">{c.title}</p><p className="text-xs capitalize text-[#5B7169]">{c.status} · {c.category}</p></div>{['draft','rejected'].includes(c.status) && <button disabled={submit.isPending} onClick={() => submit.mutate(c.id)} className="rounded-full border border-[#087B60] px-4 py-2 text-sm font-semibold text-[#087B60]">Submit for review</button>}</div>)}</section>
    </div>
  </div>
}
