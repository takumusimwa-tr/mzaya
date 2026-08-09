import PropTypes from 'prop-types'
import ConfigurationDiffViewer from './ConfigurationDiffViewer'

export default function ChangeApprovalPanel({ request, onDecision }) {
  return (
    <article className="change-approval-panel">
      <header>
        <div>
          <strong>{request.change_reference}</strong>
          <span>{request.change_type}</span>
        </div>
        <span className="master-data-status">{request.status}</span>
      </header>
      <p>{request.reason}</p>
      <ConfigurationDiffViewer diff={request.diff_payload} />
      {request.status === 'submitted' && (
        <footer>
          <button type="button" onClick={() => onDecision(request.id, 'reject')}>Reject</button>
          <button type="button" onClick={() => onDecision(request.id, 'approve')}>Approve</button>
        </footer>
      )}
    </article>
  )
}

ChangeApprovalPanel.propTypes = {
  request: PropTypes.object.isRequired,
  onDecision: PropTypes.func.isRequired,
}
