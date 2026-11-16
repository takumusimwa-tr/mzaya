export function getCampaignPhase(campaign, now = Date.now()) {
  if (campaign.status !== 'approved') return campaign.status

  const start = Date.parse(campaign.starts_at)
  const end = Date.parse(campaign.ends_at)

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 'invalid_schedule'
  }

  if (now < start) return 'scheduled'
  if (now >= end) return 'expired'

  return 'live'
}