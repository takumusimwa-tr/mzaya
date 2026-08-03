import PropTypes from 'prop-types'

export default function FinanceNarrativePanel({ narrative }) {
  return (
    <section className="executive-finance-panel finance-narrative-panel">
      <header>
        <div>
          <span>Commentary</span>
          <h2>{narrative?.title || 'Finance narrative'}</h2>
        </div>
      </header>
      <p>{narrative?.body || 'No approved commentary is available yet.'}</p>
    </section>
  )
}

FinanceNarrativePanel.propTypes = {
  narrative: PropTypes.object,
}

FinanceNarrativePanel.defaultProps = {
  narrative: null,
}
