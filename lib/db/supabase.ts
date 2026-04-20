import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role client for server-side writes (bypasses RLS). Falls back to the
// anon key for local dev without a service key — chat inserts still succeed
// because of the `leads_anon_insert` RLS policy.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });
}

// Shape of a lead row as persisted in Supabase. Note:
//   - `facility_slug` is the stable string identifier ("mission-creek").
//   - `facility_ref` is the UUID FK to public.facilities (nullable for legacy
//     facilities that only exist in data/facilities.ts).
//   - `organization_id` is the UUID FK to public.organizations. Required for
//     RLS scoping on the admin dashboard — without it the lead is invisible.
export interface LeadRow {
  session_id: string;
  facility_slug: string;
  facility_name?: string | null;
  organization_id?: string | null;
  facility_ref?: string | null;
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
  lead_score?: string | null;
  tour_requested?: boolean | null;
  tour_preferred_time?: string | null;
}

// Cache so we don't hit Supabase for every chat message.
let edenOrgIdCache: string | null = null;
const facilityRefCache = new Map<string, { id: string; org_id: string }>();

async function resolveOrgAndFacility(
  db: SupabaseClient,
  facilitySlug: string
): Promise<{ organization_id: string | null; facility_ref: string | null }> {
  // Hit cache first
  const cached = facilityRefCache.get(facilitySlug);
  if (cached) {
    return { organization_id: cached.org_id, facility_ref: cached.id };
  }

  // Try exact match on slug
  const { data: fac } = await db
    .from("facilities")
    .select("id, organization_id")
    .eq("slug", facilitySlug)
    .maybeSingle();

  if (fac) {
    facilityRefCache.set(facilitySlug, {
      id: fac.id as string,
      org_id: fac.organization_id as string,
    });
    return {
      organization_id: fac.organization_id as string,
      facility_ref: fac.id as string,
    };
  }

  // Legacy facility — not in Supabase. Fall back to the Eden org so the lead
  // still lands in the dashboard.
  if (!edenOrgIdCache) {
    const { data: org } = await db
      .from("organizations")
      .select("id")
      .eq("slug", "eden")
      .maybeSingle();
    edenOrgIdCache = (org?.id as string | undefined) ?? null;
  }
  return { organization_id: edenOrgIdCache, facility_ref: null };
}

// Merges new lead fields into the existing row (session_id is the upsert key).
// Empty strings from the AI are treated as null so we never overwrite real
// captured data with blanks. Resolves organization_id + facility_ref so the
// lead is visible to the org-scoped admin dashboard.
export async function upsertLead(row: LeadRow): Promise<void> {
  const db = getSupabaseClient();
  if (!db) {
    console.log("[lead]", row);
    return;
  }

  // Resolve org + facility FKs if the caller hasn't already done so.
  if (row.facility_slug && (!row.organization_id || !row.facility_ref)) {
    const resolved = await resolveOrgAndFacility(db, row.facility_slug);
    row.organization_id ??= resolved.organization_id;
    row.facility_ref ??= resolved.facility_ref;
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
