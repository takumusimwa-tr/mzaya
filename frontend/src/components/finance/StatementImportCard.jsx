import PropTypes from 'prop-types'

export default function StatementImportCard({ item }) {
  return (
    <article className="statement-import-card">
      <div>
        <strong>{item.import_reference}</strong>
        <span>{item.source_format.toUpperCase()}</span>
      </div>
      <div>
        <span>Transactions</span>
        <strong>{item.record_count}</strong>
      </div>
      <span className={`statement-import-status is-${item.status}`}>
        {item.status}
      </span>
    </article>
  )
}

StatementImportCard.propTypes = {
  item: PropTypes.object.isRequired,
}
