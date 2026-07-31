import useModerationQueue from '../../hooks/useModerationQueue'
import './moderation.css'

export default function ModerationQueue() {
  const { reports, loading, resolve } = useModerationQueue()

  if (loading) return <p className="moderation-state">Loading moderation queue…</p>

  return (
    <main className="moderation-queue">
      <header>
        <p>Trust & safety</p>
        <h1>Message reports</h1>
      </header>

      {!reports.length ? (
        <section className="moderation-empty">
          <h2>No open reports</h2>
          <p>The communication queue is clear.</p>
        </section>
      ) : (
        reports.map((report) => (
          <article key={report.id}>
            <div>
              <strong>{report.reason.replaceAll('_', ' ')}</strong>
              <span>{report.details || 'No additional details supplied.'}</span>
            </div>
            <div>
              <button
                type="button"
                onClick={() => resolve(report.id, {
                  status: 'dismissed',
                  resolution: 'no_violation',
                })}
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => resolve(report.id, {
                  status: 'resolved',
                  resolution: 'message_removed',
                })}
              >
                Remove message
              </button>
            </div>
          </article>
        ))
      )}
    </main>
  )
}
