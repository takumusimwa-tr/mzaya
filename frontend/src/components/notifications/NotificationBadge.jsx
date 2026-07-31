import PropTypes from 'prop-types'

export default function NotificationBadge({ count }) {
  if (!count) return null

  const label = count > 99 ? '99+' : String(count)

  return (
    <span
      className="notification-badge"
      aria-label={`${count} unread notifications`}
    >
      {label}
    </span>
  )
}

NotificationBadge.propTypes = {
  count: PropTypes.number,
}

NotificationBadge.defaultProps = {
  count: 0,
}
