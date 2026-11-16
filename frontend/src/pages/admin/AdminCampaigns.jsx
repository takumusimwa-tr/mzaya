import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adCampaignAPI } from '../../api/api'
import CampaignMetrics from '../../components/advertising/CampaignMetrics'
import CampaignPhaseBadge from '../../components/advertising/CampaignPhaseBadge'
import CampaignTrends from '../../components/advertising/CampaignTrends'

export default function AdminCampaigns() {
  const qc = useQueryClient()
  const [message, setMessage] = useState('')
  const { data, isLoading, error } = useQuery({ queryKey: ['admin-ad-campaigns'], queryFn: () => adCampaignAPI.list().then(r => r.data) })
  const change = useMutation({ mutationFn: ({ id, status }) => adCampaignAPI.setStatus(id, status), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-ad-campaigns'] }); setMessage('Campaign status updated.') }, onError: e => setMessage(e.response?.data?.error || 'Could not update campaign') })
  return <div className="min-h-screen bg-[#F7FAF8] p-5 md:p-10"><div className="mx-auto max-w-4xl space-y-6">
    <Link to="/admin" className="text-sm font-semibold text-[#087B60]">← Admin home</Link>
    <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#087B60]">Advertising operations</p><h1 className="mt-2 text-3xl font-bold text-[#123E33]">Campaign approvals</h1><p className="mt-2 text-sm text-[#5B7169]">Review vendor campaigns before they appear in customer discovery.</p></div>
    <CampaignMetrics title="Advertising performance" />
    <CampaignTrends />
    {message && <p role="status" className="rounded-xl bg-white p-3 text-sm">{message}</p>}
    {isLoading && <p>Loading campaigns…</p>}{error && <p role="alert">Could not load campaigns.</p>}
    {!isLoading && !data?.campaigns?.length && <p>No campaigns to review.</p>}
    {data?.campaigns?.map(c => <article key={c.id} className="rounded-2xl border border-[#E1EBE5] bg-white p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-4"><div><p className="text-xs font-bold uppercase text-[#087B60]">{c.category} · <CampaignPhaseBadge campaign={c} /></p><h2 className="mt-1 text-xl font-bold text-[#123E33]">{c.title}</h2><p className="mt-1 text-sm text-[#5B7169]">{c.description}</p><p className="mt-2 text-xs text-[#5B7169]">{new Date(c.starts_at).toLocaleString()} to {new Date(c.ends_at).toLocaleString()}</p>{c.image_url && <a className="mt-2 block text-sm underline text-[#087B60]" href={c.image_url} target="_blank" rel="noreferrer">View campaign image</a>}</div><div className="flex flex-wrap items-start gap-2">{['pending','approved','paused'].includes(c.status) && ['approved','rejected','paused'].filter(s => s !== c.status).map(status => <button key={status} disabled={change.isPending} onClick={() => change.mutate({ id: c.id, status })} className="rounded-full border border-[#CBDCD3] px-3 py-2 text-xs font-semibold capitalize text-[#123E33] disabled:opacity-50">{status}</button>)}</div></div></article>)}
  </div></div>
}
