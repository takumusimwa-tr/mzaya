import PropTypes from 'prop-types'

export default function PushPermissionCard({
  status,
  onEnable,
}) {
  if (status === 'registered') return null

  return (
    <section className="push-permission-card">
      <div>
        <p className="eyebrow">Stay connected</p>
        <h3>Turn on message alerts</h3>
        <p>
          Receive updates when a customer, vendor, Mzaya, or support agent
          sends you a message.
        </p>
      </div>

      <button type="button" onClick={onEnable}>
        Enable alerts
      </button>
    </section>
  )
}

PushPermissionCard.propTypes = {
  status: PropTypes.string,
  onEnable: PropTypes.func.isRequired,
}

PushPermissionCard.defaultProps = {
  status: 'idle',
}
