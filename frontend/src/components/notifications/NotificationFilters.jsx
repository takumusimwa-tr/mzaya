import PropTypes from 'prop-types'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'order', label: 'Orders' },
  { id: 'dispatch', label: 'Dispatch' },
  { id: 'payment', label: 'Payments' },
]

export default function NotificationFilters({ value, onChange }) {
  return (
    <div className="notification-filters" role="tablist">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          role="tab"
          aria-selected={value === filter.id}
          className={value === filter.id ? 'is-active' : ''}
          onClick={() => onChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

NotificationFilters.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}
