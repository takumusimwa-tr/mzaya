import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/api'
import useActiveBranch from '../../store/useActiveBranch'
import LoadingScreen from '../../components/ui/LoadingScreen'

const GREEN = '#00A651'
const GREEN_LIGHT = '#EDFAF3'

export default function VendorAnalytics() {
  const [range, setRange] = useState('week')
  const branchId = useActiveBranch((s) => s.branchId)

  const { data: stats, isLoading } = useQuery({
    queryKey: ['vendor-stats', range, branchId],
    queryFn:  () => api.get(`/vendor-stats?range=${range}${branchId ? `&branch_id=${branchId}` : ''}`).then((r) => r.data.stats),
    refetchInterval: 30000,
  })

  if (isLoading || !stats) return <LoadingScreen message="Loading analytics..." />

  const maxRevenue = Math.max(...stats.daily.map((d) => d.revenue), 1)
  const maxItemQty = Math.max(...stats.top_items.map((t) => t.qty), 1)

  return (
    <div className="h-screen overflow-y-auto bg-gray-50">
      <div className="w-full px-8 py-8">
        {/* Header + range toggle */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
          <div className="flex gap-2">
            {['week', 'month'].map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize"
                style={range === r
                  ? { background: GREEN, color: '#fff' }
                  : { background: '#F3F4F6', color: '#4B5563' }
                }>
                {r === 'week' ? 'Last 7 days' : 'Last 30 days'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label="Revenue" value={`$${stats.revenue_usd.toFixed(2)}`} accent={GREEN} />
          <StatCard label="Delivered orders" value={stats.delivered_orders} />
          <StatCard label="Total orders" value={stats.total_orders} />
          <StatCard label="Avg order" value={`$${stats.avg_order_usd.toFixed(2)}`} />
        </div>

        {/* Revenue chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Revenue over time</h2>
          {stats.revenue_usd === 0 ? (
            <EmptyChart message="No revenue in this period yet" />
          ) : (
            <div className="flex items-end gap-1 h-48">
              {stats.daily.map((d, i) => {
                const h = (d.revenue / maxRevenue) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                    <div className="w-full rounded-t transition-all"
                      style={{ height: `${Math.max(h, d.revenue > 0 ? 4 : 0)}%`, background: GREEN, minHeight: d.revenue > 0 ? '4px' : '0' }} />
                    {/* tooltip */}
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      ${d.revenue.toFixed(2)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {/* x-axis labels — show a few */}
          <div className="flex justify-between mt-2 text-[10px] text-gray-400">
            <span>{fmtDate(stats.daily[0]?.date)}</span>
            <span>{fmtDate(stats.daily[Math.floor(stats.daily.length / 2)]?.date)}</span>
            <span>{fmtDate(stats.daily[stats.daily.length - 1]?.date)}</span>
          </div>
        </div>

        {/* Orders per day */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Orders per day</h2>
          {stats.total_orders === 0 ? (
            <EmptyChart message="No orders in this period yet" />
          ) : (
            <div className="flex items-end gap-1 h-32">
              {stats.daily.map((d, i) => {
                const maxOrders = Math.max(...stats.daily.map((x) => x.orders), 1)
                const h = (d.orders / maxOrders) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                    <div className="w-full rounded-t"
                      style={{ height: `${Math.max(h, d.orders > 0 ? 6 : 0)}%`, background: '#86EFAC', minHeight: d.orders > 0 ? '6px' : '0' }} />
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded z-10">
                      {d.orders}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top items */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Top items</h2>
          {stats.top_items.length === 0 ? (
            <p className="text-sm text-gray-400">No sales yet in this period.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.top_items.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-800 font-medium">{item.name}</span>
                    <span className="text-gray-500">{item.qty} sold · ${item.revenue.toFixed(2)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width: `${(item.qty / maxItemQty) * 100}%`, background: GREEN }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-black" style={{ color: accent || '#111827' }}>{value}</p>
    </div>
  )
}

function EmptyChart({ message }) {
  return (
    <div className="h-32 flex items-center justify-center text-sm text-gray-300">{message}</div>
  )
}

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-ZW', { day: 'numeric', month: 'short' })
}
