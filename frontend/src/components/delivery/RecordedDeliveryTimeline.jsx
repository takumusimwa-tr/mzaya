const labels = { pending: 'Awaiting assignment', accepted: 'Mzaya assigned', picked_up: 'Picked up', en_route: 'On the way', delivered: 'Delivered', cancelled: 'Cancelled' }

export default function RecordedDeliveryTimeline({ events = [] }) {
  return <section className="mzaya-surface p-5" aria-label="Recorded delivery history">
    <h2 className="font-semibold text-[var(--mzaya-text-primary)]">Delivery history</h2>
    <p className="mt-1 text-xs text-[var(--mzaya-text-secondary)]">Recorded events only. Earlier activity may not be available.</p>
    {events.length === 0 ? <p className="mt-4 text-sm">No recorded events yet.</p> : <ol className="mt-4 space-y-4">
      {events.map(event => <li key={event.id} className="flex gap-3">
        <span aria-hidden="true" className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--mzaya-primary)]" />
        <div><p className="text-sm font-medium">{labels[event.to_status] || event.to_status}</p>
          {event.createdAt && <time dateTime={event.createdAt} className="text-xs text-[var(--mzaya-text-secondary)]">{new Date(event.createdAt).toLocaleString()}</time>}
        </div>
      </li>)}
    </ol>}
  </section>
}
