/**
 * Compatibility adapter for legacy order/category badges.
 *
 * New work should use StatusBadge directly.
 */
import StatusBadge from '../common/StatusBadge'

export default function Badge({ label, type }) {
  const category = ['food', 'grocery', 'materials', 'errand'].includes(type)

  return (
    <StatusBadge
      status={category ? undefined : type}
      tone={category ? 'neutral' : undefined}
    >
      {label}
    </StatusBadge>
  )
}
