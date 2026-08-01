import PropTypes from 'prop-types'

export default function TaxRegistrationTable({ registrations }) {
  return (
    <div className="tax-registration-table">
      {registrations.map((registration) => (
        <article key={registration.id}>
          <div>
            <strong>{registration.legal_name}</strong>
            <span>{registration.registration_type.replaceAll('_', ' ')}</span>
          </div>
          <code>{registration.registration_number}</code>
          <span>{registration.status}</span>
        </article>
      ))}
    </div>
  )
}

TaxRegistrationTable.propTypes = {
  registrations: PropTypes.array.isRequired,
}
