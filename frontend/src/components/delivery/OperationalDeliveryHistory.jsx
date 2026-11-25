import { useQuery } from '@tanstack/react-query'
import useAuthStore from '../../store/useAuthStore'
import { deliveryProofAPI } from '../../api/deliveryProof'
import RecordedDeliveryTimeline from './RecordedDeliveryTimeline'
import DeliveryEvidenceSummary from './DeliveryEvidenceSummary'

function QueryState({ query, label }) {
  return <section className="mzaya-surface p-5" aria-label={label}>
    <h2 className="font-semibold">{label}</h2>
    <p role="status" className="mt-2 text-sm">{query.isError ? 'Unable to retrieve this information. Check the order and your access.' : 'Loading…'}</p>
    {query.isError && <button type="button" className="mt-3 text-sm font-semibold text-[var(--mzaya-primary)]" onClick={() => query.refetch()}>Try again</button>}
  </section>
}

export default function OperationalDeliveryHistory({ orderId, status }) {
  const user = useAuthStore(s => s.user)
  const role = user?.role
  const enabled = Boolean(user?.id && orderId && ['vendor', 'admin'].includes(role))
  const active = !['delivered', 'cancelled', 'failed'].includes(status)
  const history = useQuery({
    queryKey: ['operational-delivery-timeline', role, user?.id, orderId, status],
    queryFn: ({ signal }) => deliveryProofAPI.timeline(orderId, signal).then(r => r.data.events),
    enabled, retry: false, refetchInterval: active ? 15000 : false,
  })
  const evidence = useQuery({
    queryKey: ['operational-delivery-proof', role, user?.id, orderId, status],
    queryFn: ({ signal }) => deliveryProofAPI.read(orderId, signal).then(r => r.data.proof),
    enabled: enabled && (role === 'admin' || status === 'delivered'),
    retry: false, refetchInterval: active ? 15000 : false,
  })
  if (!enabled) return null
  const proof = evidence.data
  return <div className="my-4 space-y-3">
    {history.isPending || history.isError ? <QueryState query={history} label="Delivery history" /> : <RecordedDeliveryTimeline events={history.data || []} />}
    {(role === 'admin' || status === 'delivered') && (evidence.isPending || evidence.isError ? <QueryState query={evidence} label="Delivery evidence" /> : <>
      <DeliveryEvidenceSummary proof={proof} />
      {role === 'admin' && proof && <section className="mzaya-surface p-5 space-y-2 text-sm break-words">
        <h2 className="font-semibold">Recorded handover details</h2>
        {proof.recipient_name && <p>Recipient: {proof.recipient_name}</p>}
        {proof.notes && <p>Notes: {proof.notes}</p>}
        {proof.photo_url && <p>Photo reference recorded</p>}
        {proof.signature_url && <p>Signature reference recorded</p>}
        <p className="text-xs text-[var(--mzaya-text-secondary)]">External media is not loaded automatically.</p>
      </section>}
    </>)}
  </div>
}
