import PropTypes from 'prop-types'

export default function ConsumerLagCard({ consumer }) {
  return (
    <article className="consumer-lag-card">
      <div>
        <span>{consumer.partition_key}</span>
        <strong>{consumer.consumer_key}</strong>
      </div>
      <strong>{consumer.lag_seconds}s</strong>
      <span>{consumer.status}</span>
    </article>
  )
}

ConsumerLagCard.propTypes = {
  consumer: PropTypes.object.isRequired,
}
