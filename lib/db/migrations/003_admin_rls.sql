-- ── Migration 003: RLS policy for authenticated admin reads ──────────────────
--
-- Run this in the Supabase SQL editor AFTER 002.
--
-- Supabase Auth setup required before this migration is useful:
--   1. Authentication → Providers → Email → Enable
--   2. Authentication → URL Configuration → Redirect URLs → add:
--        https://eden-chat.vercel.app/auth/callback
--        http://localhost:3000/auth/callback
--   3. Invite admin users via Supabase Dashboard → Authentication → Users
--      (or send a magic link via the login page once deployed)
--
-- The service role key used by /api/admin/leads bypasses RLS automatically.
-- This policy enables future client-side Supabase queries from authenticated
-- admins if needed.
-- ─────────────────────────────────────────────────────────────────────────────

-- Authenticated users (staff who signed in via magic link) can read all leads.
DROP POLICY IF EXISTS "authenticated_read_leads" ON leads;
CREATE POLICY "authenticated_read_leads" ON leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users cannot insert/update/delete directly — all writes go
-- through the server-side API using the service role key.
