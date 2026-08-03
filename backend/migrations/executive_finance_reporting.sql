-- Mzaya Batch 08.4.4
-- Executive KPI governance, reporting packs, narratives, schedules,
-- distributions, alerts, and executive finance snapshots.

CREATE TABLE IF NOT EXISTS finance_kpi_definitions (
  id UUID PRIMARY KEY,
  kpi_key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  category VARCHAR(60) NOT NULL,
  description VARCHAR(1000),
  formula_version INTEGER NOT NULL DEFAULT 1,
  unit VARCHAR(30) NOT NULL,
  aggregation_method VARCHAR(40) NOT NULL,
  data_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_value NUMERIC(24,8),
  warning_threshold NUMERIC(24,8),
  critical_threshold NUMERIC(24,8),
  favorable_direction VARCHAR(20) NOT NULL DEFAULT 'higher',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_kpi_snapshots (
  id UUID PRIMARY KEY,
  kpi_definition_id UUID NOT NULL
    REFERENCES finance_kpi_definitions(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  period_type VARCHAR(20) NOT NULL,
  period_key VARCHAR(30) NOT NULL,
  currency VARCHAR(3),
  dimension_type VARCHAR(40),
  dimension_value VARCHAR(160),
  value NUMERIC(24,8) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'normal',
  source_lineage JSONB NOT NULL DEFAULT '[]'::jsonb,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(
    kpi_definition_id,
    snapshot_date,
    period_type,
    period_key,
    currency,
    dimension_type,
    dimension_value
  )
);

CREATE INDEX IF NOT EXISTS finance_kpi_snapshots_lookup_idx
  ON finance_kpi_snapshots(kpi_definition_id, snapshot_date DESC);

CREATE TABLE IF NOT EXISTS finance_reporting_packs (
  id UUID PRIMARY KEY,
  pack_reference VARCHAR(120) NOT NULL UNIQUE,
  pack_type VARCHAR(30) NOT NULL,
  title VARCHAR(220) NOT NULL,
  period_from DATE NOT NULL,
  period_to DATE NOT NULL,
  currency VARCHAR(3),
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  export_storage_key TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (period_to >= period_from)
);

CREATE TABLE IF NOT EXISTS finance_reporting_sections (
  id UUID PRIMARY KEY,
  reporting_pack_id UUID NOT NULL
    REFERENCES finance_reporting_packs(id) ON DELETE CASCADE,
  section_key VARCHAR(100) NOT NULL,
  title VARCHAR(180) NOT NULL,
  section_type VARCHAR(40) NOT NULL,
  sequence INTEGER NOT NULL DEFAULT 100,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'ready',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(reporting_pack_id, section_key)
);

CREATE TABLE IF NOT EXISTS finance_narratives (
  id UUID PRIMARY KEY,
  reporting_pack_id UUID
    REFERENCES finance_reporting_packs(id) ON DELETE CASCADE,
  section_id UUID
    REFERENCES finance_reporting_sections(id) ON DELETE CASCADE,
  narrative_type VARCHAR(40) NOT NULL,
  title VARCHAR(180),
  body TEXT NOT NULL,
  generated_from JSONB NOT NULL DEFAULT '[]'::jsonb,
  authored_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_reporting_schedules (
  id UUID PRIMARY KEY,
  schedule_key VARCHAR(100) NOT NULL UNIQUE,
  pack_type VARCHAR(30) NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  day_of_week INTEGER,
  day_of_month INTEGER,
  hour_utc INTEGER NOT NULL DEFAULT 6,
  currency VARCHAR(3),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_reporting_distributions (
  id UUID PRIMARY KEY,
  reporting_pack_id UUID NOT NULL
    REFERENCES finance_reporting_packs(id) ON DELETE CASCADE,
  recipient_type VARCHAR(30) NOT NULL,
  recipient_value VARCHAR(255) NOT NULL,
  delivery_channel VARCHAR(30) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  delivered_at TIMESTAMPTZ,
  failure_reason VARCHAR(1000),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS executive_finance_alerts (
  id UUID PRIMARY KEY,
  kpi_snapshot_id UUID
    REFERENCES finance_kpi_snapshots(id) ON DELETE SET NULL,
  alert_type VARCHAR(60) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(220) NOT NULL,
  description VARCHAR(1500),
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
