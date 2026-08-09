import PropTypes from 'prop-types'

export default function ConfigurationDiffViewer({ diff }) {
  const entries = Object.entries(diff || {})
  if (!entries.length) return <p className="master-data-empty">No configuration changes.</p>

  return (
    <div className="configuration-diff">
      {entries.map(([field, change]) => (
        <article key={field}>
          <strong>{field}</strong>
          <span>{JSON.stringify(change.before)}</span>
          <span>→</span>
          <span>{JSON.stringify(change.after)}</span>
        </article>
      ))}
    </div>
  )
}

ConfigurationDiffViewer.propTypes = { diff: PropTypes.object }
ConfigurationDiffViewer.defaultProps = { diff: {} }
