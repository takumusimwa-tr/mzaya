import PropTypes from 'prop-types'

export default function DataQualityScorecard({ results }) {
  const total = results.length
  const failed = results.filter((item) => item.result === 'failed').length
  const score = total ? ((total - failed) / total) * 100 : 100

  return (
    <section className="data-quality-scorecard">
      <article><span>Data quality score</span><strong>{score.toFixed(1)}%</strong></article>
      <article><span>Checks evaluated</span><strong>{total}</strong></article>
      <article><span>Open issues</span><strong>{failed}</strong></article>
    </section>
  )
}

DataQualityScorecard.propTypes = { results: PropTypes.array.isRequired }
