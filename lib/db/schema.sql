-- ── Eden Care Assistant — Leads Table ───────────────────────────────────────
--
-- Run this in the Supabase SQL editor.
-- The chat API uses the service role key (SUPABASE_SERVICE_ROLE_KEY) to upsert
-- without being blocked by RLS. If you only have the anon key, enable the
-- policy commented out at the bottom.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leads (
  id                   uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id           text          NOT NULL,
  facility_id          text          NOT NULL,
  facility_name        text,

  -- Visitor contact
  visitor_name         text,
  visitor_phone        text,
  visitor_email        text,

  -- Patient info
  patient_name         text,
  patient_relationship text,           -- son, daughter, spouse, self, healthcare professional

  -- Care context
  care_type_interest   text,           -- short_term_rehab, long_term_care, memory_care, etc.
  current_situation    text,           -- at_hospital, at_home, at_another_facility, researching
  insurance_type       text,           -- Medicare, Medicaid, Advantage plan name, VA, private_pay
  timeline             text,           -- immediate, within_a_week, within_a_month, just_researching

  -- Referral context
  hospital_name        text,           -- critical for SNF discharge referrals
  referral_source      text,

  -- Audience classification
  audience_type        text,           -- family, professional, self, other

  -- Summary & raw payload
  conversation_summary text,
  raw_lead_json        jsonb,

  -- Timestamps
  created_at           timestamptz   NOT NULL DEFAULT now(),
  updated_at           timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT leads_session_id_unique UNIQUE (session_id)
);

-- Index for admissions dashboard queries
CREATE INDEX IF NOT EXISTS leads_facility_id_idx  ON leads (facility_id);
CREATE INDEX IF NOT EXISTS leads_created_at_idx   ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_visitor_phone_idx ON leads (visitor_phone) WHERE visitor_phone IS NOT NULL;

-- Auto-update updated_at on every upsert
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS leads_updated_at_trigger ON leads;
CREATE TRIGGER leads_updated_at_trigger
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_leads_updated_at();

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- ── If using service role key (recommended): RLS is bypassed automatically.
-- ── If using anon key: uncomment the policy below.
--
-- CREATE POLICY "api_upsert_leads" ON leads
--   FOR ALL
--   TO anon
--   USING (true)
--   WITH CHECK (true);
