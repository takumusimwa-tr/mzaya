import PropTypes from 'prop-types'

export default function MasterDataDomainCard({ domain, recordCount }) {
  return (
    <article className="master-data-domain-card">
      <div>
        <span>{domain.record_type}</span>
        <strong>{domain.name}</strong>
      </div>
      <strong>{recordCount}</strong>
      <span>{domain.requires_approval ? 'Approval required' : 'Direct maintenance'}</span>
    </article>
  )
}

MasterDataDomainCard.propTypes = {
  domain: PropTypes.object.isRequired,
  recordCount: PropTypes.number.isRequired,
}
