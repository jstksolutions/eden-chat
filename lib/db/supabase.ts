import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Use service role key for server-side writes (bypasses RLS).
// Falls back to anon key so local dev works without a service role key.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Returns null when env vars are not configured so callers can skip gracefully.
export function getSupabaseClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });
}

export interface LeadRow {
  session_id: string;
  facility_id: string;
  facility_name?: string | null;
  visitor_name?: string | null;
  visitor_phone?: string | null;
  visitor_email?: string | null;
  patient_name?: string | null;
  patient_relationship?: string | null;
  care_type_interest?: string | null;
  current_situation?: string | null;
  insurance_type?: string | null;
  timeline?: string | null;
  hospital_name?: string | null;
  referral_source?: string | null;
  audience_type?: string | null;
  conversation_summary?: string | null;
  raw_lead_json?: Record<string, unknown> | null;
  // Scoring & tour (migration 002)
  lead_score?: string | null;
  tour_requested?: boolean | null;
  tour_preferred_time?: string | null;
}

// Merges new lead fields into the existing row (session_id is the upsert key).
// Empty strings from the AI are treated as null — never overwrite real data with blanks.
export async function upsertLead(row: LeadRow): Promise<void> {
  const db = getSupabaseClient();
  if (!db) {
    console.log("[lead]", row);
    return;
  }

  // Strip empty strings so we never blank out a previously captured field.
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    clean[k] = typeof v === "string" && v.trim() === "" ? null : v;
  }

  const { error } = await db
    .from("leads")
    .upsert(clean as unknown as LeadRow, {
      onConflict: "session_id",
      ignoreDuplicates: false,
    });

  if (error) {
    console.error("[lead upsert error]", error.message);
  }
}
