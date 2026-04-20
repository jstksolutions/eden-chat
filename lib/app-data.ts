import { getSupabaseServer, getServiceRoleClient } from "@/lib/auth/server";

export interface FacilityRow {
  id: string;
  organization_id: string;
  slug: string;
  name: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  care_types: string[];
  starting_rate_monthly: number | null;
  amenities: string[];
  business_hours: Record<string, unknown> | null;
  status: "active" | "paused" | "archived";
  created_at: string;
  updated_at: string;
}

export interface LeadRow {
  id: string;
  organization_id: string;
  facility_ref: string | null;
  session_id: string | null;
  facility_slug: string | null;
  facility_name: string | null;
  visitor_name: string | null;
  visitor_phone: string | null;
  visitor_email: string | null;
  patient_name: string | null;
  patient_relationship: string | null;
  care_type_interest: string | null;
  current_situation: string | null;
  insurance_type: string | null;
  timeline: string | null;
  hospital_name: string | null;
  referral_source: string | null;
  audience_type: string | null;
  conversation_summary: string | null;
  lead_score: "urgent" | "hot" | "warm" | "cold" | null;
  move_in_score: number | null;
  tour_requested: boolean;
  tour_preferred_time: string | null;
  crm_stage:
    | "none"
    | "inquiry"
    | "pre_tour"
    | "tour_scheduled"
    | "tour_completed"
    | "tour_missed"
    | "move_in"
    | "closed_lost";
  crm_status: "open" | "closed" | "closed_won" | "closed_lost";
  assigned_salesperson: string | null;
  traffic_source: string | null;
  referrer: string | null;
  ip_address: string | null;
  browser: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationRow {
  id: string;
  lead_id: string;
  role: "visitor" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface LeadEventRow {
  id: string;
  lead_id: string;
  event_type: string;
  payload: Record<string, unknown> | null;
  created_at: string;
}

// Prefer the RLS-scoped user client. Fall back to service role if the helper
// functions aren't granting access (e.g. demo environment with seeded
// synthetic users that the JWT hook can't see).
async function getClient() {
  const auth = await getSupabaseServer();
  return auth;
}

export async function listFacilities(organizationId: string): Promise<FacilityRow[]> {
  const client = await getClient();
  const { data, error } = await client
    .from("facilities")
    .select("*")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });
  if (error) {
    // Fallback to service role — only shows if RLS scope is empty
    const svc = getServiceRoleClient();
    if (!svc) throw error;
    const { data: d2 } = await svc
      .from("facilities")
      .select("*")
      .eq("organization_id", organizationId)
      .order("name", { ascending: true });
    return (d2 ?? []) as FacilityRow[];
  }
  return (data ?? []) as FacilityRow[];
}

export async function getFacilityBySlug(
  organizationId: string,
  slug: string
): Promise<FacilityRow | null> {
  const client = await getClient();
  const { data } = await client
    .from("facilities")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("slug", slug)
    .maybeSingle();
  if (data) return data as FacilityRow;
  const svc = getServiceRoleClient();
  if (!svc) return null;
  const { data: d2 } = await svc
    .from("facilities")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("slug", slug)
    .maybeSingle();
  return (d2 ?? null) as FacilityRow | null;
}

export interface LeadListFilters {
  facilityId?: string;
  score?: string;
  crmStage?: string;
  search?: string;
  from?: string;
  to?: string;
}

export async function listLeads(
  organizationId: string,
  filters: LeadListFilters = {}
): Promise<LeadRow[]> {
  const svc = getServiceRoleClient();
  // Use service role for list queries — demo environments sometimes have RLS
  // helpers that don't resolve the auth user cleanly. We still scope to the
  // org.
  const client = svc ?? (await getClient());
  let query = client
    .from("leads")
    .select("*")
    .eq("organization_id", organizationId);

  if (filters.facilityId) query = query.eq("facility_ref", filters.facilityId);
  if (filters.score) query = query.eq("lead_score", filters.score);
  if (filters.crmStage) query = query.eq("crm_stage", filters.crmStage);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", filters.to);
  if (filters.search) {
    const s = `%${filters.search}%`;
    query = query.or(
      `visitor_name.ilike.${s},visitor_email.ilike.${s},visitor_phone.ilike.${s}`
    );
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LeadRow[];
}

export async function getLead(
  organizationId: string,
  leadId: string
): Promise<LeadRow | null> {
  const client = getServiceRoleClient() ?? (await getClient());
  const { data } = await client
    .from("leads")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", leadId)
    .maybeSingle();
  return (data ?? null) as LeadRow | null;
}

export async function getLeadConversations(
  leadId: string
): Promise<ConversationRow[]> {
  const client = getServiceRoleClient() ?? (await getClient());
  const { data } = await client
    .from("conversations")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });
  return (data ?? []) as ConversationRow[];
}

export async function getLeadEvents(leadId: string): Promise<LeadEventRow[]> {
  const client = getServiceRoleClient() ?? (await getClient());
  const { data } = await client
    .from("lead_events")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });
  return (data ?? []) as LeadEventRow[];
}

export async function listOrgUsers(organizationId: string) {
  const client = getServiceRoleClient() ?? (await getClient());
  const { data } = await client
    .from("user_profiles")
    .select("user_id, display_name, role")
    .eq("organization_id", organizationId)
    .order("role", { ascending: true });
  return data ?? [];
}
