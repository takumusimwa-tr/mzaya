import PropTypes from 'prop-types'
import useProviderWebhookEvents from '../../hooks/useProviderWebhookEvents'
import './providerWebhooks.css'

export default function ProviderWebhookQueue({ filters }) {
  const {
    events,
    loading,
    retry,
  } = useProviderWebhookEvents(filters)

  if (loading) {
    return <p className="provider-webhook-state">Loading provider events…</p>
  }

  return (
    <section className="provider-webhook-queue">
      <header>
        <div>
          <p className="finance-eyebrow">Provider operations</p>
          <h2>Webhook queue</h2>
        </div>
      </header>

      {!events.length ? (
        <div className="provider-webhook-empty">
          <h3>No provider events</h3>
          <p>Webhook deliveries will appear here.</p>
        </div>
      ) : (
        <div className="provider-webhook-queue__items">
          {events.map((event) => (
            <article key={event.id}>
              <div>
                <strong>{event.event_type}</strong>
                <span>
                  {event.provider} · {event.provider_event_id}
                </span>
              </div>

              <div>
                <span>Status</span>
                <strong>{event.status.replaceAll('_', ' ')}</strong>
              </div>

              <div>
                <span>Attempts</span>
                <strong>{event.attempt_count}</strong>
              </div>

              {['failed', 'dead_letter'].includes(event.status) && (
                <button type="button" onClick={() => retry(event.id)}>
                  Retry
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

ProviderWebhookQueue.propTypes = {
  filters: PropTypes.object,
}

ProviderWebhookQueue.defaultProps = {
  filters: {},
}
