import { useQuery } from '@tanstack/react-query'
import { adAnalyticsAPI } from '../../api/api'

export default function CampaignMetrics({ title = 'Campaign performance' }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ad-analytics-summary'],
    queryFn: () => adAnalyticsAPI.summary().then(r => r.data),
    staleTime: 60_000,
  })
  return <section className="rounded-2xl border border-[#E1EBE5] bg-white p-5" aria-label={title}>
    <h2 className="text-lg font-bold text-[#123E33]">{title}</h2>
    <p className="mt-1 text-xs text-[#5B7169]">Impressions count displayed campaigns. CTR is clicks divided by impressions.</p>
    {isLoading && <p className="mt-3 text-sm">Loading performance...</p>}
    {isError && <p role="alert" className="mt-3 text-sm">Performance data is unavailable.</p>}
    {!isLoading && !isError && !data?.campaigns?.length && <p className="mt-3 text-sm">No campaigns to report.</p>}
    {!!data?.campaigns?.length && <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm">
      <thead><tr className="border-b border-[#E1EBE5] text-[#5B7169]"><th className="py-2">Campaign</th><th>Impressions</th><th>Clicks</th><th>CTR</th></tr></thead>
      <tbody>{data.campaigns.map(c => <tr key={c.id} className="border-b border-[#E1EBE5] last:border-0">
        <td className="py-3 pr-4 font-medium text-[#123E33]">{c.title}</td><td>{c.impressions}</td><td>{c.clicks}</td><td>{c.ctr}%</td>
      </tr>)}</tbody>
    </table></div>}
  </section>
}
