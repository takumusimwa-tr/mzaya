import PropTypes from 'prop-types'
import useSupportTicket from '../../hooks/useSupportTicket'
import ChatWindow from '../chat/ChatWindow'
import InternalNotesPanel from './InternalNotesPanel'
import TicketAuditTimeline from './TicketAuditTimeline'
import './support.css'

export default function SupportTicketWorkspace({
  ticketId,
  currentUserId,
  customer,
  onBack,
}) {
  const {
    ticket,
    loading,
    update,
    addNote,
  } = useSupportTicket(ticketId)

  if (loading || !ticket) {
    return <p className="support-state">Loading ticket…</p>
  }

  return (
    <section className="support-workspace">
      <div className="support-workspace__chat">
        <ChatWindow
          conversationId={ticket.conversation_id}
          currentUserId={currentUserId}
          participant={customer}
          onBack={onBack}
        />
      </div>

      <aside className="support-workspace__sidebar">
        <section className="ticket-controls">
          <p className="eyebrow">Ticket controls</p>
          <h2>{ticket.subject}</h2>

          <label>
            Status
            <select
              value={ticket.status}
              onChange={(event) => update({ status: event.target.value })}
            >
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="waiting_customer">Waiting for customer</option>
              <option value="waiting_internal">Waiting internally</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </label>

          <label>
            Priority
            <select
              value={ticket.priority}
              onChange={(event) => update({ priority: event.target.value })}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
        </section>

        <InternalNotesPanel
          notes={ticket.internalNotes}
          onAdd={addNote}
        />

        <TicketAuditTimeline entries={ticket.audit} />
      </aside>
    </section>
  )
}

SupportTicketWorkspace.propTypes = {
  ticketId: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired,
  customer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
}
