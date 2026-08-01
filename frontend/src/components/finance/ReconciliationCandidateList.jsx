import PropTypes from 'prop-types'

export default function ReconciliationCandidateList({
  candidates,
  onAccept,
  onReject,
}) {
  return (
    <div className="reconciliation-candidate-list">
      {candidates.map((candidate) => (
        <article key={candidate.id}>
          <div>
            <strong>
              {(Number(candidate.score) * 100).toFixed(1)}% match
            </strong>
            <span>{candidate.ledger_transaction_id}</span>
          </div>

          <div>
            <span>Amount</span>
            <strong>
              {(Number(candidate.amount_score) * 100).toFixed(0)}%
            </strong>
          </div>

          <div className="reconciliation-candidate-list__actions">
            <button type="button" onClick={() => onReject(candidate.id)}>
              Reject
            </button>
            <button type="button" onClick={() => onAccept(candidate.id)}>
              Accept
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

ReconciliationCandidateList.propTypes = {
  candidates: PropTypes.array.isRequired,
  onAccept: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
}
