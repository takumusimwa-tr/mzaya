'use strict';

function campaignPhase(campaign, now = new Date()) {
  if (campaign.status !== 'approved') return campaign.status;
  const start = new Date(campaign.starts_at).getTime();
  const end = new Date(campaign.ends_at).getTime();
  const current = now.getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 'invalid_schedule';
  if (current < start) return 'scheduled';
  if (current >= end) return 'expired';
  return 'live';
}

function canTransition(from, to) {
  const allowed = {
    draft: ['pending'],
    pending: ['approved', 'rejected'],
    approved: ['paused'],
    paused: ['approved', 'rejected'],
    rejected: ['pending'],
  };
  return Boolean(allowed[from]?.includes(to));
}

module.exports = { campaignPhase, canTransition };
