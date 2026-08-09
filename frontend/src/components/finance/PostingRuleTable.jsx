import PropTypes from 'prop-types'

export default function PostingRuleTable({ rules }) {
  return (
    <div className="finance-posting-rule-table">
      {rules.map((rule) => (
        <article key={rule.id}>
          <div>
            <strong>{rule.rule_key}</strong>
            <span>{rule.event_type}</span>
          </div>
          <span>{rule.source_system || 'Any source'}</span>
          <strong>#{rule.priority}</strong>
          <span>{rule.posting_template_key}</span>
        </article>
      ))}
    </div>
  )
}

PostingRuleTable.propTypes = {
  rules: PropTypes.array.isRequired,
}
