import { useState } from 'react'
import PropTypes from 'prop-types'
import useNotifications from '../../hooks/useNotifications'
import NotificationBell from './NotificationBell'
import NotificationDrawer from './NotificationDrawer'
import './notifications.css'

export default function NotificationCenter({ token }) {
  const [open, setOpen] = useState(false)

  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    markRead,
    markAllRead,
    archive,
    loadMore,
  } = useNotifications({ token })

  return (
    <div className="notification-center">
      <NotificationBell
        unreadCount={unreadCount}
        open={open}
        onToggle={() => setOpen((current) => !current)}
      />

      <NotificationDrawer
        open={open}
        notifications={notifications}
        loading={loading}
        hasMore={hasMore}
        onClose={() => setOpen(false)}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onArchive={archive}
        onLoadMore={loadMore}
      />
    </div>
  )
}

NotificationCenter.propTypes = {
  token: PropTypes.string.isRequired,
}
