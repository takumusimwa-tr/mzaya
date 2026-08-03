import PropTypes from 'prop-types'

function EntityNode({ entity, depth = 0 }) {
  return (
    <article
      className="entity-tree-node"
      style={{ '--entity-depth': depth }}
    >
      <div>
        <strong>{entity.legal_name}</strong>
        <span>
          {entity.country_code} · {entity.functional_currency}
        </span>
      </div>
      <span>{(Number(entity.ownership_ratio) * 100).toFixed(1)}%</span>
    </article>
  )
}

EntityNode.propTypes = {
  entity: PropTypes.object.isRequired,
  depth: PropTypes.number,
}

EntityNode.defaultProps = {
  depth: 0,
}

export default function EntityTree({ members }) {
  return (
    <div className="entity-tree">
      {members.map((member) => (
        <EntityNode
          key={member.id}
          entity={member.legalEntity || member}
        />
      ))}
    </div>
  )
}

EntityTree.propTypes = {
  members: PropTypes.array.isRequired,
}
