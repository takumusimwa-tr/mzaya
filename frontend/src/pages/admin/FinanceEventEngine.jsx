import useFinanceEventEngine from '../../hooks/useFinanceEventEngine'
import EventPipeline from '../../components/finance/EventPipeline'
import '../../components/finance/financeEventEngine.css'

export default function FinanceEventEngine() {
  const {
    events,
    loading,
    processEvent,
  } = useFinanceEventEngine()

  if (loading) {
    return <p className="finance-event-state">Loading finance event engine…</p>
  }

  return (
    <main className="finance-event-page">
      <header>
        <div>
          <p className="finance-eyebrow">Accounting infrastructure</p>
          <h1>Event engine</h1>
          <p>
            Business events, accounting preparation, retries, and ledger traceability.
          </p>
        </div>
      </header>

      <EventPipeline events={events} />

      <section className="finance-event-list">
        {events.map((event) => (
          <article key={event.id}>
            <div>
              <strong>{event.event_type}</strong>
              <span>{event.source_system} · {event.event_key}</span>
            </div>
            <span>{event.currency || '—'}</span>
            <span className="finance-event-status">{event.status}</span>
            {['received', 'failed'].includes(event.status) ? (
              <button
                type="button"
                onClick={() => processEvent(event.id)}
              >
                Process
              </button>
            ) : <span />}
          </article>
        ))}
      </section>
    </main>
  )
}
