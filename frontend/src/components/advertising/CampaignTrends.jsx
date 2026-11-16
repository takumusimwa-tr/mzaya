import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/api'

export default function CampaignTrends() {
  const [days, setDays] = useState(14)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ad-trends', days],
    queryFn: () => api.get('/ad-trends', { params: { days } }).then(r => r.data),
    staleTime: 60_000,
  })
  const max = Math.max(1, ...(data?.series || []).map(d => d.impressions))
  return <section className="rounded-2xl border border-[#E1EBE5] bg-white p-5" aria-label="Advertising trends">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-lg font-bold text-[#123E33]">Advertising trends</h2><p className="text-xs text-[#5B7169]">Daily events in UTC. CTR = clicks / impressions.</p></div>
      <label className="text-sm text-[#123E33]">Period <select value={days} onChange={e => setDays(Number(e.target.value))} className="ml-2 rounded-lg border border-[#CBDCD3] p-2">{[7, 14, 30].map(n => <option key={n} value={n}>{n} days</option>)}</select></label>
    </div>
    {isLoading && <p className="mt-4 text-sm">Loading trends...</p>}
    {isError && <div className="mt-4 text-sm" role="alert">Trends unavailable. <button className="underline" onClick={() => refetch()}>Retry</button></div>}
    {data && <>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">{[['Impressions', data.total.impressions], ['Clicks', data.total.clicks], ['CTR', `${data.total.ctr}%`]].map(([name, value]) => <div key={name} className="rounded-xl bg-[#F1F7F4] p-3"><p className="text-lg font-bold text-[#086C55]">{value}</p><p className="text-xs text-[#5B7169]">{name}</p></div>)}</div>
      <div className="mt-5 flex h-36 items-end gap-1" role="img" aria-label={`Impressions per day over the last ${days} days`}>
        {data.series.map(d => <div key={d.date} title={`${d.date}: ${d.impressions} impressions, ${d.clicks} clicks`} className="min-w-0 flex-1 rounded-t bg-[#086C55]" style={{ height: `${Math.max(d.impressions ? 3 : 0, d.impressions / max * 100)}%` }} />)}
      </div>
      <div className="mt-2 flex justify-between text-xs text-[#5B7169]"><span>{data.series[0]?.date}</span><span>{data.series.at(-1)?.date}</span></div>
      <p className="mt-3 text-xs text-[#5B7169]">These are recorded events, not verified unique people or billable advertising metrics.</p>
    </>}
  </section>
}
