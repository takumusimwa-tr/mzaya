import PropTypes from 'prop-types'

export default function BankMovementTable({ movements }) {
  return (
    <div className="bank-movement-table">
      {movements.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.bank_movement_reference}</strong>
            <span>{item.bank_reference || 'No bank reference'}</span>
          </div>
          <span>{item.direction}</span>
          <span>{item.currency}</span>
          <span>{item.status}</span>
        </article>
      ))}
    </div>
  )
}

BankMovementTable.propTypes = {
  movements: PropTypes.array.isRequired,
}
