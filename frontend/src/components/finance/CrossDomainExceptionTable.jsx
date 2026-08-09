import PropTypes from 'prop-types'

export default function CrossDomainExceptionTable({ exceptions }) {
  return (
    <div className="cross-domain-exception-table">
      {exceptions.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.exception_code}</strong>
            <span>{item.domain_key}</span>
          </div>
          <span>{item.severity}</span>
          <span>{item.status}</span>
          <p>{item.message}</p>
        </article>
      ))}
    </div>
  )
}

CrossDomainExceptionTable.propTypes = {
  exceptions: PropTypes.array.isRequired,
}
