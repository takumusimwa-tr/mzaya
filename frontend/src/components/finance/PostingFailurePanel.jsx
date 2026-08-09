import PropTypes from 'prop-types'

export default function PostingFailurePanel({ failures }) {
  return (
    <section className="finance-event-panel">
      <header>
        <div>
          <span>Exceptions</span>
          <h2>Posting failures</h2>
        </div>
        <strong>{failures.length}</strong>
      </header>

      <div className="finance-posting-failures">
        {failures.map((failure) => (
          <article key={failure.id}>
            <div>
              <strong>{failure.failure_code}</strong>
              <span>{failure.failure_stage}</span>
            </div>
            <p>{failure.error_message}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

PostingFailurePanel.propTypes = {
  failures: PropTypes.array.isRequired,
}
