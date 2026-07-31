import PropTypes from 'prop-types'
import NotificationBadge from './NotificationBadge'

export default function NotificationBell({
  unreadCount,
  open,
  onToggle,
}) {
  return (
    <button
      type="button"
      className={`notification-bell ${open ? 'is-open' : ''}`}
      onClick={onToggle}
      aria-label="Open notifications"
      aria-expanded={open}
    >
      <span aria-hidden="true" className="notification-bell__icon">
        🔔
      </span>
      <NotificationBadge count={unreadCount} />
    </button>
  )
}

NotificationBell.propTypes = {
  unreadCount: PropTypes.number,
  open: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
}

NotificationBell.defaultProps = {
  unreadCount: 0,
  open: false,
}
