import { useQuery } from '@tanstack/react-query'
import { deliveryProofAPI } from '../../api/deliveryProof'
import useAuthStore from '../../store/useAuthStore'
import useSocketEvent from '../../hooks/useSocketEvent'
import RecordedDeliveryTimeline from './RecordedDeliveryTimeline'
import DeliveryEvidenceSummary from './DeliveryEvidenceSummary'

function Unavailable({ label, query }) {
  return <section className="mzaya-surface p-5" aria-label={label}>
    <h2 className="font-semibold">{label}</h2>
    <p className="mt-2 text-sm" role="status">{query.isError ? 'Unable to load this information.' : 'Loading…'}</p>
    {query.isError && <button type="button" className="mt-3 text-sm font-semibold text-[var(--mzaya-primary)]" onClick={() => query.refetch()}>Try again</button>}
  </section>
}

export default function CustomerDeliveryHistory({ orderId, status }) {
  const userId = useAuthStore(s => s.user?.id)
  const enabled = Boolean(userId && orderId)
  const delivered = status === 'delivered'
  const active = !['delivered', 'cancelled', 'failed'].includes(status)
  const history = useQuery({
    queryKey: ['customer-delivery-timeline', userId, orderId, status],
    queryFn: ({ signal }) => deliveryProofAPI.timeline(orderId, signal).then(r => r.data.events),
    enabled,
    refetchInterval: active ? 20000 : false,
    retry: false,
  })
  const evidence = useQuery({
    queryKey: ['customer-delivery-proof', userId, orderId],
    queryFn: ({ signal }) => deliveryProofAPI.read(orderId, signal).then(r => r.data.proof),
    enabled: enabled && delivered,
    retry: false,
  })
  useSocketEvent('order:status_changed', payload => {
    if (enabled && payload?.orderId === orderId) {
      history.refetch()
      if (delivered) evidence.refetch()
    }
  }, [enabled, orderId, status, userId])
  if (!enabled) return null
  return <div className="mx-4 my-4 space-y-3">
    {history.isPending || history.isError ? <Unavailable label="Delivery history" query={history} /> : <RecordedDeliveryTimeline events={history.data || []} />}
    {delivered && (evidence.isPending || evidence.isError ? <Unavailable label="Delivery evidence" query={evidence} /> : <DeliveryEvidenceSummary proof={evidence.data} />)}
  </div>
}
