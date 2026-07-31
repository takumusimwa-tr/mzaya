import PropTypes from 'prop-types'

export default function ChatUnreadBadge({ count }) {
  if (!count) return null

  return (
    <span
      className="chat-unread-badge"
      aria-label={`${count} unread messages`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

ChatUnreadBadge.propTypes = {
  count: PropTypes.number,
}

ChatUnreadBadge.defaultProps = {
  count: 0,
}
