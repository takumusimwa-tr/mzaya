import PropTypes from 'prop-types'
import useSupportQueue from '../../hooks/useSupportQueue'
import './support.css'

export default function SupportQueue({ filters, onOpen }) {
  const {
    tickets,
    loading,
    hasMore,
    loadMore,
  } = useSupportQueue(filters)

  if (loading) {
    return <p className="support-state">Loading support queue…</p>
  }

  return (
    <section className="support-queue">
      <header>
        <div>
          <p className="eyebrow">Support operations</p>
          <h1>Customer support inbox</h1>
        </div>
      </header>

      {!tickets.length ? (
        <div className="support-empty">
          <h2>Queue clear</h2>
          <p>No support conversations match the current filters.</p>
        </div>
      ) : (
        <div className="support-queue__items">
          {tickets.map((ticket) => (
            <button
              type="button"
              key={ticket.id}
              onClick={() => onOpen(ticket)}
            >
              <div className="support-queue__main">
                <strong>{ticket.subject}</strong>
                <span>
                  {ticket.customer?.first_name} {ticket.customer?.last_name}
                </span>
              </div>

              <div className="support-queue__meta">
                <span className={`priority is-${ticket.priority}`}>
                  {ticket.priority}
                </span>
                <span>{ticket.status.replaceAll('_', ' ')}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          className="support-queue__more"
          onClick={loadMore}
        >
          Load more
        </button>
      )}
    </section>
  )
}

SupportQueue.propTypes = {
  filters: PropTypes.object,
  onOpen: PropTypes.func.isRequired,
}

SupportQueue.defaultProps = {
  filters: {},
}
