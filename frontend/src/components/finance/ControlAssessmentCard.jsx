import PropTypes from 'prop-types'

export default function ControlAssessmentCard({ assessment }) {
  return (
    <article className="control-assessment-card">
      <div>
        <span>{assessment.control_area}</span>
        <strong>{assessment.control_name}</strong>
      </div>
      <strong>
        {assessment.effectiveness_score == null
          ? '—'
          : `${(Number(assessment.effectiveness_score) * 100).toFixed(1)}%`}
      </strong>
      <span className={`audit-status is-${assessment.operating_rating}`}>
        {assessment.operating_rating?.replaceAll('_', ' ')}
      </span>
    </article>
  )
}

ControlAssessmentCard.propTypes = {
  assessment: PropTypes.object.isRequired,
}
