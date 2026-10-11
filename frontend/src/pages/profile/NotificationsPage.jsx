/**
 * Notification center.
 * Uses the existing notification API/realtime hook; no parallel persistence is introduced.
 * Visual branding remains intentionally deferred.
 */
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import useNotifications from '../../hooks/useNotifications'
import Button from '../../components/ui/Button'

function formatWhen(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(date)
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    loadMore,
    markRead,
    markAllRead,
    archive,
    refresh,
  } = useNotifications({ token })

  const openNotification = async (notification) => {
    try {
      if (!notification.read_at) await markRead(notification.id)
    } finally {
      if (notification.action_url) navigate(notification.action_url)
    }
  }

  return (
    <div className="min-h-screen pb-12">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 pb-4 pt-12">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => navigate('/profile', { replace: true })}
            className="rounded-full bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700"
            aria-label="Go back">‹</button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            <p className="text-xs text-gray-500">
              {unreadCount ? `${unreadCount} unread` : 'You are all caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button type="button" onClick={() => markAllRead()}
              className="text-xs font-semibold text-gray-700">
              Mark all read
            </button>
          )}
        </div>
      </header>

      <main className="px-4 pt-4">
        {loading ? (
          <p className="py-12 text-center text-sm text-gray-500">Loading notifications...</p>
        ) : error ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center">
            <p className="text-sm text-gray-600">We could not load your notifications.</p>
            <Button className="mt-4" onClick={refresh}>Try again</Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
            <h2 className="font-semibold text-gray-900">No notifications yet</h2>
            <p className="mt-2 text-sm text-gray-500">
              Order, payment and account updates will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <article key={notification.id}
                className={`rounded-2xl border bg-white p-4 shadow-sm ${
                  notification.read_at ? 'border-gray-100' : 'border-green-200'
                }`}>
                <button type="button" onClick={() => openNotification(notification)}
                  className="w-full text-left">
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 h-2.5 w-2.5 flex-none rounded-full ${
                      notification.read_at ? 'bg-gray-200' : 'bg-green-500'
                    }`} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-gray-900">
                        {notification.title}
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-gray-600">
                        {notification.body}
                      </span>
                      <span className="mt-2 block text-xs text-gray-400">
                        {formatWhen(notification.created_at)}
                      </span>
                    </span>
                  </div>
                </button>
                <div className="mt-3 flex justify-end gap-3 border-t border-gray-50 pt-3">
                  {!notification.read_at && (
                    <button type="button" onClick={() => markRead(notification.id)}
                      className="text-xs font-semibold text-gray-600">Mark read</button>
                  )}
                  <button type="button" onClick={() => archive(notification.id)}
                    className="text-xs font-semibold text-gray-500">Archive</button>
                </div>
              </article>
            ))}
          </div>
        )}

        {hasMore && !loading && !error && (
          <div className="mt-4">
            <Button variant="outline" onClick={loadMore}>Load more</Button>
          </div>
        )}
      </main>
    </div>
  )
}
