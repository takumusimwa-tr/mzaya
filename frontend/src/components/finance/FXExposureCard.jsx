import PropTypes from 'prop-types'

export default function FXExposureCard({ exposure }) {
  return (
    <article className="fx-exposure-card">
      <div>
        <span>{exposure.currency}</span>
        <strong>{exposure.exposure_type.replaceAll('_', ' ')}</strong>
      </div>
      <strong>
        {exposure.reporting_currency}{' '}
        {(Number(exposure.reporting_value_minor) / 100).toFixed(2)}
      </strong>
      <span>{exposure.status}</span>
    </article>
  )
}

FXExposureCard.propTypes = {
  exposure: PropTypes.object.isRequired,
}
