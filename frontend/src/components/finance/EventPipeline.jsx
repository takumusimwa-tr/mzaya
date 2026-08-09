import PropTypes from 'prop-types'

export default function EventPipeline({ events }) {
  const metrics = [
    ['Received', events.filter((item) => item.status === 'received').length],
    ['Processing', events.filter((item) => item.status === 'processing').length],
    ['Prepared', events.filter((item) => item.status === 'prepared').length],
    ['Failed', events.filter((item) => item.status === 'failed').length],
  ]

  return (
    <section className="finance-event-pipeline">
      {metrics.map(([label, value]) => (
        <article key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </section>
  )
}

EventPipeline.propTypes = {
  events: PropTypes.array.isRequired,
}
