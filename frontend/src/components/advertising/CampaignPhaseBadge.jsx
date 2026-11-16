import { getCampaignPhase } from '../../utils/campaignPhase'

const phaseLabels = {
  draft: 'Draft',
  pending: 'Awaiting review',
  approved: 'Approved',
  rejected: 'Rejected',
  paused: 'Paused',
  scheduled: 'Scheduled',
  live: 'Live',
  expired: 'Expired',
  invalid_schedule: 'Schedule issue',
}

export default function CampaignPhaseBadge({ campaign }) {
  const phase = getCampaignPhase(campaign)

  return (
    <span
      className="inline-flex rounded-full border border-[#CBDCD3] bg-[#F0F7F3] px-2.5 py-1 text-xs font-semibold text-[#123E33]"
      aria-label={`Campaign phase: ${phaseLabels[phase] || phase}`}
    >
      {phaseLabels[phase] || phase}
    </span>
  )
}