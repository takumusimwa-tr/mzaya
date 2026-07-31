import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import EmptyNotifications from './EmptyNotifications'
import NotificationCard from './NotificationCard'
import NotificationFilters from './NotificationFilters'

export default function NotificationDrawer({
  open,
  notifications,
  loading,
  hasMore,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onArchive,
  onLoadMore,
}) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const visibleNotifications = useMemo(() => {
    if (filter === 'all') return notifications
    if (filter === 'unread') {
      return notifications.filter((item) => !item.read_at)
    }
    return notifications.filter((item) => item.category === filter)
  }, [notifications, filter])

  const openNotification = async (notification) => {
    if (!notification.read_at) {
      await onMarkRead(notification.id)
    }

    onClose()
    if (notification.action_url) {
      navigate(notification.action_url)
    }
  }

  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="notification-drawer__backdrop"
        onClick={onClose}
        aria-label="Close notifications"
      />

      <aside className="notification-drawer" aria-label="Notifications">
        <header className="notification-drawer__header">
          <div>
            <span className="notification-drawer__eyebrow">Mzaya</span>
            <h2>Notifications</h2>
          </div>

          <button
            type="button"
            className="notification-drawer__close"
            onClick={onClose}
            aria-label="Close notifications"
          >
            ×
          </button>
        </header>

        <div className="notification-drawer__toolbar">
          <NotificationFilters value={filter} onChange={setFilter} />
          <button
            type="button"
            className="notification-drawer__mark-all"
            onClick={onMarkAllRead}
          >
            Mark all read
          </button>
        </div>

        <div className="notification-drawer__list">
          {loading && !notifications.length ? (
            <div className="notification-drawer__loading">Loading…</div>
          ) : visibleNotifications.length ? (
            visibleNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onOpen={openNotification}
                onArchive={onArchive}
              />
            ))
          ) : (
            <EmptyNotifications />
          )}
        </div>

        {hasMore && (
          <footer className="notification-drawer__footer">
            <button type="button" onClick={onLoadMore}>
              Load more
            </button>
          </footer>
        )}
      </aside>
    </>
  )
}

NotificationDrawer.propTypes = {
  open: PropTypes.bool,
  notifications: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  hasMore: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onMarkRead: PropTypes.func.isRequired,
  onMarkAllRead: PropTypes.func.isRequired,
  onArchive: PropTypes.func.isRequired,
  onLoadMore: PropTypes.func.isRequired,
}

NotificationDrawer.defaultProps = {
  open: false,
  notifications: [],
  loading: false,
  hasMore: false,
}
