import PropTypes from 'prop-types'

function formatTimestamp(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function NotificationCard({
  notification,
  onOpen,
  onArchive,
}) {
  const unread = !notification.read_at

  return (
    <article
      className={`notification-card ${unread ? 'is-unread' : ''}`}
      aria-label={notification.title}
    >
      <button
        type="button"
        className="notification-card__body"
        onClick={() => onOpen(notification)}
      >
        <span
          className={`notification-card__icon notification-card__icon--${notification.category}`}
          aria-hidden="true"
        >
          {notification.icon?.slice(0, 1)?.toUpperCase() || 'M'}
        </span>

        <span className="notification-card__content">
          <span className="notification-card__topline">
            <strong>{notification.title}</strong>
            {unread && (
              <span className="notification-card__dot" aria-label="Unread" />
            )}
          </span>

          <span className="notification-card__message">
            {notification.body}
          </span>

          <time
            className="notification-card__time"
            dateTime={notification.created_at}
          >
            {formatTimestamp(notification.created_at)}
          </time>
        </span>
      </button>

      <button
        type="button"
        className="notification-card__archive"
        onClick={() => onArchive(notification.id)}
        aria-label={`Archive ${notification.title}`}
      >
        ×
      </button>
    </article>
  )
}

NotificationCard.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    category: PropTypes.string,
    icon: PropTypes.string,
    title: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    action_url: PropTypes.string,
    read_at: PropTypes.string,
    created_at: PropTypes.string,
  }).isRequired,
  onOpen: PropTypes.func.isRequired,
  onArchive: PropTypes.func.isRequired,
}
