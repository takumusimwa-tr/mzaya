-- Batch 05. Selective migration. Requires repaired ad_campaigns table.
CREATE TABLE IF NOT EXISTS public.ad_campaign_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  event_type varchar(12) NOT NULL CHECK (event_type IN ('impression', 'click')),
  event_key uuid NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, event_type, event_key)
);
CREATE INDEX IF NOT EXISTS ad_campaign_events_summary_idx
  ON public.ad_campaign_events (campaign_id, occurred_at, event_type);
