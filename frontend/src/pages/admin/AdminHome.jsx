import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'
import useAuthStore from '../../store/useAuthStore'
import LoadingScreen from '../../components/ui/LoadingScreen'

export default function AdminHome() {
  const user     = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const logout   = useAuthStore((s) => s.logout)

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

  if (isLoading) return <LoadingScreen message="Loading analytics..." />

  const recentTrends  = trends?.trends?.slice(0, 7) || []
  const totalRevenue  = recentTrends.reduce((sum, t) => sum + (t.total_spend_usd || 0), 0)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="bg-gray-900 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-400 text-xs">Admin panel</p>
            <h1 className="text-white font-bold text-lg mt-0.5">{user?.name}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/10 text-white text-xs px-3 py-2 rounded-xl font-medium"
          >
            Logout
          </button>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-white font-bold text-xl">{metrics?.totalPayments || 0}</p>
            <p className="text-gray-400 text-xs">Total orders</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-white font-bold text-xl">${totalRevenue.toFixed(0)}</p>
            <p className="text-gray-400 text-xs">7-day revenue</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className={`font-bold text-xl ${(metrics?.anomalyRate || 0) > 0.1 ? 'text-red-400' : 'text-green-400'}`}>
              {((metrics?.anomalyRate || 0) * 100).toFixed(1)}%
            </p>
            <p className="text-gray-400 text-xs">Anomaly rate</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-white font-bold text-xl">{metrics?.anomalyCount || 0}</p>
            <p className="text-gray-400 text-xs">Flagged orders</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-4">
        {/* Anomaly alerts */}
        {anomalies?.anomalies?.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <h2 className="text-sm font-bold text-red-700 mb-3">
              ⚠️ Anomaly alerts ({anomalies.anomalies.length})
            </h2>
            {anomalies.anomalies.slice(0, 3).map((a) => (
              <div key={a.order_id} className="flex items-center justify-between py-2 border-b border-red-100 last:border-0">
                <div>
                  <p className="text-xs font-mono text-red-500">#{a.order_id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-red-700 capitalize">{a.category_type} · {a.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-700">${a.total_usd.toFixed(2)}</p>
                  <p className="text-xs text-red-400">score: {a.anomaly_score.toFixed(3)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ML model status */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-3">ML Model Status</h2>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Model</span>
              <span className="font-medium text-gray-900">{metrics?.modelName || 'Not trained'} {metrics?.modelVersion ? `v${metrics.modelVersion}` : ''}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Last trained</span>
              <span className="text-gray-700">
                {metrics?.lastTrainedAt
                  ? new Date(metrics.lastTrainedAt).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                  : 'Never'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Std deviation</span>
              <span className="text-gray-700">{metrics?.avgStdDev?.toFixed(4) || '—'}</span>
            </div>
          </div>
          <button
            onClick={() => api.post('/analytics/train').then(() => alert('Model retraining started'))}
            className="w-full mt-4 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold active:scale-95"
          >
            Retrain model now
          </button>
        </div>

        {/* Spending trends */}
        {recentTrends.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-700 mb-3">Recent spending trends</h2>
            {recentTrends.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-xs text-gray-500">{new Date(t.day).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short' })}</p>
                  <p className="text-sm font-medium text-gray-800 capitalize">{t.category_type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">${t.total_spend_usd.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{t.order_count} orders</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 pb-6">
          <button
            onClick={() => api.post('/analytics/train').then(() => alert('Training started'))}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left active:scale-98"
          >
            <p className="text-2xl mb-2">🤖</p>
            <p className="text-sm font-bold text-gray-900">Train ML</p>
            <p className="text-xs text-gray-400">Retrain anomaly model</p>
          </button>
          <button
            onClick={() => api.post('/features/bulk-extract').then(() => alert('Feature extraction started'))}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left active:scale-98"
          >
            <p className="text-2xl mb-2">⚙️</p>
            <p className="text-sm font-bold text-gray-900">Extract features</p>
            <p className="text-xs text-gray-400">Backfill ML features</p>
          </button>
        </div>
      </div>
    </div>
  )
}
