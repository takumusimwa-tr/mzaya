import PropTypes from 'prop-types'

export default function PeriodLockTable({ locks }) {
  return (
    <div className="period-lock-table">
      {locks.map((lock) => (
        <article key={lock.id}>
          <div><strong>{lock.period_key}</strong><span>{lock.scope_type}</span></div>
          <span>{lock.scope_value || 'All'}</span>
          <span>{lock.currency || 'All currencies'}</span>
          <span className="master-data-status">{lock.lock_type} · {lock.status}</span>
        </article>
      ))}
    </div>
  )
}

PeriodLockTable.propTypes = { locks: PropTypes.array.isRequired }
