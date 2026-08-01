import { useEffect, useMemo, useState, useCallback } from 'react'
import api from '../../api/api'
import '../../components/notifications/notifications.css'

const FILTERS = ['all', 'pending', 'failed', 'delivered', 'skipped']

export default function NotificationOperations() {
  const [summary, setSummary] = useState(null)
  const [deliveries, setDeliveries] = useState([])
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    setLoading(true)

    try {
      const [{ data: health }, { data: deliveryData }] = await Promise.all([
        api.get('/admin/notifications/health'),
        api.get('/admin/notifications/deliveries', {
          params: status === 'all' ? {} : { status },
        }),
      ])

      setSummary(health.summary)
      setDeliveries(deliveryData.deliveries || [])
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    load()
  }, [load])

  const failedCount = useMemo(
    () => Number(summary?.deliveries?.failed || 0),
    [summary]
  )

  const retry = async (deliveryId) => {
    setMessage('')

    try {
      await api.post(
        `/admin/notifications/deliveries/${deliveryId}/retry`
      )
      setMessage('Delivery retry started')
      await load()
    } catch {
      setMessage('Unable to retry delivery')
    }
  }

  return (
    <main className="notification-operations">
      <header>
        <span>Operations</span>
        <h1>Notification delivery</h1>
        <p>Monitor delivery health and retry failed provider messages.</p>
      </header>

      <section className="notification-health-grid">
        <article>
          <span>Total notifications</span>
          <strong>{summary?.notifications ?? '—'}</strong>
        </article>
        <article>
          <span>Unread</span>
          <strong>{summary?.unread ?? '—'}</strong>
        </article>
        <article>
          <span>Failed deliveries</span>
          <strong>{failedCount}</strong>
        </article>
        <article>
          <span>Delivered</span>
          <strong>{summary?.deliveries?.delivered ?? 0}</strong>
        </article>
      </section>

      <div className="notification-operations__filters">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            className={status === filter ? 'is-active' : ''}
            onClick={() => setStatus(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {message && <p role="status">{message}</p>}

      <section className="notification-delivery-table">
        {loading ? (
          <p>Loading delivery records…</p>
        ) : deliveries.length ? (
          deliveries.map((delivery) => (
            <article key={delivery.id}>
              <div>
                <strong>{delivery.notification?.title || 'Notification'}</strong>
                <span>{delivery.channel} · {delivery.status}</span>
              </div>

              <div>
                <span>Attempts: {delivery.attempts}</span>
                {delivery.last_error && (
                  <small>{delivery.last_error}</small>
                )}
              </div>

              {delivery.status === 'failed' &&
                delivery.channel !== 'in_app' && (
                  <button
                    type="button"
                    onClick={() => retry(delivery.id)}
                  >
                    Retry
                  </button>
                )}
            </article>
          ))
        ) : (
          <p>No delivery records match this filter.</p>
        )}
      </section>
    </main>
  )
}
