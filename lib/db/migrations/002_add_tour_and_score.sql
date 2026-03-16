-- ── Migration 002: Add tour scheduling + lead scoring columns ────────────────
--
-- Run this in the Supabase SQL editor AFTER 001 (schema.sql).
-- Safe to run multiple times (IF NOT EXISTS / idempotent).
-- ─────────────────────────────────────────────────────────────────────────────

-- Lead score tier (computed server-side before upsert)
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS lead_score text
    CHECK (lead_score IN ('urgent', 'hot', 'warm', 'cold'));

-- Tour scheduling fields (Vista AL/MC facilities only, but stored for all)
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS tour_requested     boolean NOT NULL DEFAULT false;

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS tour_preferred_time text;

-- Index on lead_score for dashboard filtering
CREATE INDEX IF NOT EXISTS leads_lead_score_idx ON leads (lead_score);

-- Index on tour_requested for quick tour-request queries
CREATE INDEX IF NOT EXISTS leads_tour_requested_idx ON leads (tour_requested)
  WHERE tour_requested = true;
