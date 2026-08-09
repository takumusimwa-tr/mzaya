import PropTypes from 'prop-types'

export default function LegacyPostingAttemptTable({ attempts }) {
  return (
    <div className="legacy-posting-attempt-table">
      {attempts.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.source_module}</strong>
            <span>{item.source_action || 'legacy ledger post'}</span>
          </div>
          <span>{item.result}</span>
          <span>{item.attempted_at}</span>
        </article>
      ))}
    </div>
  )
}

LegacyPostingAttemptTable.propTypes = {
  attempts: PropTypes.array.isRequired,
}
