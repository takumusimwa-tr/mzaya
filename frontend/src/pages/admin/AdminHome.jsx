import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { adminAPI, promoAPI } from '../../api/api'
import api from '../../api/api'
import useAuthStore from '../../store/useAuthStore'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Icon from '../../components/ui/Icon'

const TABS = ['Overview', 'Vendors', 'Mzayas', 'Promos', 'Live', 'Mzaya AI']

export default function AdminHome() {
  const user     = useAuthStore((s) => s.user)
  const logout   = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [tab, setTab] = useState('Overview')

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-gray-900 px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-400 text-xs">Admin panel</p>
            <h1 className="text-white font-bold text-lg mt-0.5">{user?.name}</h1>
          </div>
          <button onClick={handleLogout}
            className="bg-white/10 text-white text-xs px-3 py-2 rounded-xl font-medium">
            Logout
          </button>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
              style={tab === t
                ? { background: '#00A651', color: '#fff' }
                : { background: 'rgba(255,255,255,0.1)', color: '#9CA3AF' }
              }>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        {tab === 'Overview' && <Overview />}
        {tab === 'Vendors'  && <VendorsQueue />}
        {tab === 'Mzayas'   && <RidersQueue />}
        {tab === 'Promos'   && <PromosManager />}
        {tab === 'Live'     && <LiveOrders />}
        {tab === 'Mzaya AI' && <MzayaAI />}
      </div>
    </div>
  )
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function Overview() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn:  () => adminAPI.overview().then((r) => r.data.overview),
    refetchInterval: 30000,
  })
  if (isLoading) return <LoadingScreen message="Loading overview..." />
  const o = data || {}
  const cards = [
    { label: 'Revenue today', value: `$${(o.revenue_today || 0).toFixed(2)}`, accent: '#00A651' },
    { label: 'Orders today', value: o.orders_today || 0 },
    { label: 'Active orders', value: o.active_orders || 0 },
    { label: 'Customers', value: o.total_customers || 0 },
    { label: 'Vendors', value: o.total_vendors || 0 },
    { label: 'Pending vendors', value: o.pending_vendors || 0, accent: o.pending_vendors ? '#D97706' : undefined },
    { label: 'Mzayas', value: o.total_riders || 0 },
    { label: 'Pending Mzayas', value: o.pending_riders || 0, accent: o.pending_riders ? '#D97706' : undefined },
  ]
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">{c.label}</p>
          <p className="text-xl font-black" style={{ color: c.accent || '#111827' }}>{c.value}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Vendors approval queue ───────────────────────────────────────────────────
function VendorsQueue() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('pending')

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['admin-vendors', filter],
    queryFn:  () => adminAPI.vendors(filter).then((r) => r.data.vendors),
  })

  const approve = useMutation({
    mutationFn: (id) => adminAPI.approveVendor(id),
    onSuccess:  () => queryClient.invalidateQueries(['admin-vendors']),
  })
  const reject = useMutation({
    mutationFn: (id) => adminAPI.rejectVendor(id),
    onSuccess:  () => queryClient.invalidateQueries(['admin-vendors']),
  })

  return (
    <div>
      <FilterRow options={['pending', 'active', 'all']} value={filter} onChange={setFilter} />
      {isLoading ? <LoadingScreen message="Loading vendors..." /> : (
        <div className="flex flex-col gap-2 mt-3">
          {!vendors?.length && <Empty label="No vendors here" />}
          {vendors?.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900">{v.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{v.category} · {v.city?.name || '—'}</p>
                  {v.owner && <p className="text-xs text-gray-400 mt-0.5">{v.owner.name} · {v.owner.phone}</p>}
                </div>
                <StatusPill active={v.is_active} />
              </div>
              <div className="flex gap-2 mt-3">
                {!v.is_active ? (
                  <button onClick={() => approve.mutate(v.id)} disabled={approve.isPending}
                    className="flex-1 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
                    style={{ background: '#00A651' }}>
                    Approve
                  </button>
                ) : (
                  <button onClick={() => reject.mutate(v.id)} disabled={reject.isPending}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600">
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Riders approval queue ────────────────────────────────────────────────────
function RidersQueue() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('pending')

  const { data: riders, isLoading } = useQuery({
    queryKey: ['admin-riders', filter],
    queryFn:  () => adminAPI.riders(filter).then((r) => r.data.riders),
  })
  const approve = useMutation({
    mutationFn: (id) => adminAPI.approveRider(id),
    onSuccess:  () => queryClient.invalidateQueries(['admin-riders']),
  })

  return (
    <div>
      <FilterRow options={['pending', 'approved', 'all']} value={filter} onChange={setFilter} />
      {isLoading ? <LoadingScreen message="Loading Mzayas..." /> : (
        <div className="flex flex-col gap-2 mt-3">
          {!riders?.length && <Empty label="No Mzayas here" />}
          {riders?.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900">{r.user?.name || 'Mzaya'}</p>
                  <p className="text-xs text-gray-400">{r.user?.phone} · {r.city?.name || '—'}</p>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">{r.vehicle_type?.replace('_', ' ') || 'no vehicle'}</p>
                </div>
                <StatusPill active={r.is_approved} activeLabel="Approved" inactiveLabel="Pending" />
              </div>
              {!r.is_approved && (
                <button onClick={() => approve.mutate(r.id)} disabled={approve.isPending}
                  className="w-full mt-3 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
                  style={{ background: '#00A651' }}>
                  Approve
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Promo manager ────────────────────────────────────────────────────────────
function PromosManager() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', min_order_usd: '', max_discount_usd: '', usage_limit: '', expires_at: '' })

  const { data: promos, isLoading } = useQuery({
    queryKey: ['admin-promos'],
    queryFn:  () => promoAPI.list().then((r) => r.data.promos),
  })
  const create = useMutation({
    mutationFn: (data) => promoAPI.create(data),
    onSuccess:  () => { queryClient.invalidateQueries(['admin-promos']); setShowForm(false); resetForm() },
  })
  const toggle = useMutation({
    mutationFn: ({ id, is_active }) => promoAPI.update(id, { is_active }),
    onSuccess:  () => queryClient.invalidateQueries(['admin-promos']),
  })
  const remove = useMutation({
    mutationFn: (id) => promoAPI.remove(id),
    onSuccess:  () => queryClient.invalidateQueries(['admin-promos']),
  })

  const resetForm = () => setForm({ code: '', type: 'percent', value: '', min_order_usd: '', max_discount_usd: '', usage_limit: '', expires_at: '' })

  const submit = () => {
    if (!form.code) return
    create.mutate({
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: parseFloat(form.value) || 0,
      min_order_usd: parseFloat(form.min_order_usd) || 0,
      max_discount_usd: form.max_discount_usd ? parseFloat(form.max_discount_usd) : null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      expires_at: form.expires_at || null,
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-gray-900">Promo codes</h2>
        <button onClick={() => setShowForm((s) => !s)}
          className="text-sm font-semibold text-white px-3 py-1.5 rounded-lg"
          style={{ background: '#00A651' }}>
          {showForm ? 'Cancel' : '+ New code'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-3 flex flex-col gap-2">
          <input placeholder="CODE" value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm uppercase" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm">
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed $ off</option>
            <option value="free_delivery">Free delivery</option>
          </select>
          {form.type !== 'free_delivery' && (
            <input placeholder={form.type === 'percent' ? 'e.g. 20 (%)' : 'e.g. 2 ($)'} type="number" value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
          )}
          <input placeholder="Min order $ (optional)" type="number" value={form.min_order_usd}
            onChange={(e) => setForm({ ...form, min_order_usd: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
          <input placeholder="Usage limit (optional)" type="number" value={form.usage_limit}
            onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
          <button onClick={submit} disabled={create.isPending}
            className="py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
            style={{ background: '#00A651' }}>
            {create.isPending ? 'Creating…' : 'Create code'}
          </button>
          {create.error && <p className="text-xs text-red-500">{create.error.response?.data?.error || 'Failed'}</p>}
        </div>
      )}

      {isLoading ? <LoadingScreen message="Loading promos..." /> : (
        <div className="flex flex-col gap-2">
          {!promos?.length && <Empty label="No promo codes yet" />}
          {promos?.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900">{p.code}</p>
                  <p className="text-xs text-gray-400">
                    {p.type === 'percent' && `${p.value}% off`}
                    {p.type === 'fixed' && `$${p.value} off`}
                    {p.type === 'free_delivery' && 'Free delivery'}
                    {Number(p.min_order_usd) > 0 && ` · min $${p.min_order_usd}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Used {p.used_count}{p.usage_limit ? ` / ${p.usage_limit}` : ''}
                  </p>
                </div>
                <StatusPill active={p.is_active} activeLabel="Active" inactiveLabel="Off" />
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => toggle.mutate({ id: p.id, is_active: !p.is_active })}
                  className="flex-1 py-1.5 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600">
                  {p.is_active ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => remove.mutate(p.id)}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-red-50 text-red-500">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Live orders ──────────────────────────────────────────────────────────────
function LiveOrders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-live'],
    queryFn:  () => adminAPI.liveOrders().then((r) => r.data.orders),
    refetchInterval: 10000,
  })
  if (isLoading) return <LoadingScreen message="Loading live orders..." />
  return (
    <div className="flex flex-col gap-2">
      {!orders?.length && <Empty label="No active orders right now" />}
      {orders?.map((o) => (
        <div key={o.id} className="bg-white rounded-2xl p-3 border border-gray-100 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-mono text-gray-400">#{o.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-sm text-gray-700 capitalize">{o.category_type} · {o.city}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold px-2 py-1 rounded-full capitalize"
              style={{ background: '#EDFAF3', color: '#00A651' }}>
              {o.status.replace('_', ' ')}
            </span>
            <p className="text-sm font-bold text-gray-900 mt-1">US${Number(o.total_usd).toFixed(2)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Mzaya AI (ML insights) ───────────────────────────────────────────────────
function MzayaAI() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['model-metrics'],
    queryFn:  () => api.get('/analytics/model-metrics').then((r) => r.data),
  })
  const { data: anomalies } = useQuery({
    queryKey: ['anomalies'],
    queryFn:  () => api.get('/analytics/anomalies').then((r) => r.data),
  })
  const { data: trends } = useQuery({
    queryKey: ['spending-trends'],
    queryFn:  () => api.get('/analytics/spending-trends').then((r) => r.data),
  })

  if (isLoading) return <LoadingScreen message="Loading Mzaya AI..." />

  const recentTrends = trends?.trends?.slice(0, 7) || []
  const maxSpend = Math.max(...recentTrends.map((t) => t.total_spend_usd || 0), 1)
  const anomalyRate = metrics?.anomalyRate || 0

  return (
    <div className="flex flex-col gap-4">
      {/* Intro */}
      <div className="rounded-2xl p-4" style={{ background: '#EDFAF3', border: '1px solid #BBF7D0' }}>
        <p className="text-sm font-bold" style={{ color: '#00A651' }}><Icon name="ai" size={14} className="inline" /> Mzaya AI</p>
        <p className="text-xs mt-1" style={{ color: '#15803D' }}>
          Live intelligence from the ML service — order anomaly detection, demand signals, and spending trends.
        </p>
      </div>

      {/* Model metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Model status</p>
          <p className="text-lg font-black" style={{ color: metrics?.modelLoaded ? '#00A651' : '#DC2626' }}>
            {metrics?.modelLoaded ? 'Active' : 'Offline'}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Orders analysed</p>
          <p className="text-lg font-black text-gray-900">{metrics?.totalPayments || 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Anomaly rate</p>
          <p className="text-lg font-black" style={{ color: anomalyRate > 0.1 ? '#DC2626' : '#00A651' }}>
            {(anomalyRate * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Flagged orders</p>
          <p className="text-lg font-black text-gray-900">{metrics?.anomalyCount || 0}</p>
        </div>
      </div>

      {/* Anomaly alerts */}
      {anomalies?.anomalies?.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-3">
            <Icon name="warning" size={14} className="inline" /> Flagged orders ({anomalies.anomalies.length})
          </h2>
          <div className="flex flex-col gap-2">
            {anomalies.anomalies.slice(0, 6).map((a) => (
              <div key={a.order_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-xs font-mono text-gray-500">#{a.order_id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-gray-500 capitalize">{a.category_type} · {a.city}</p>
                </div>
                <span className="text-sm font-bold text-red-500">US${Number(a.total_usd || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spending trends */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 mb-4">Spending trend (7 days)</h2>
        {recentTrends.length === 0 ? (
          <p className="text-sm text-gray-400">No trend data yet.</p>
        ) : (
          <div className="flex items-end gap-2 h-32">
            {recentTrends.slice().reverse().map((t, i) => {
              const h = ((t.total_spend_usd || 0) / maxSpend) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                  <div className="w-full rounded-t" style={{ height: `${Math.max(h, 4)}%`, background: '#00A651' }} />
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded z-10">
                    ${(t.total_spend_usd || 0).toFixed(0)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── shared bits ──────────────────────────────────────────────────────────────
function FilterRow({ options, value, onChange }) {
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
          style={value === o ? { background: '#00A651', color: '#fff' } : { background: '#F3F4F6', color: '#6B7280' }}>
          {o}
        </button>
      ))}
    </div>
  )
}

function StatusPill({ active, activeLabel = 'Active', inactiveLabel = 'Pending' }) {
  return (
    <span className="text-xs font-semibold px-2 py-1 rounded-full"
      style={active ? { background: '#EDFAF3', color: '#00A651' } : { background: '#FEF3C7', color: '#B45309' }}>
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}

function Empty({ label }) {
  return <div className="text-center text-sm text-gray-400 py-10">{label}</div>
}
