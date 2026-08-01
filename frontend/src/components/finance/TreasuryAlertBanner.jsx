import PropTypes from 'prop-types'

export default function TreasuryAlertBanner({ alert }) {
  return (
    <article className={`treasury-alert is-${alert.severity}`}>
      <div>
        <strong>{alert.title}</strong>
        <p>{alert.description}</p>
      </div>
      <span>{alert.severity}</span>
    </article>
  )
}

TreasuryAlertBanner.propTypes = {
  alert: PropTypes.object.isRequired,
}
