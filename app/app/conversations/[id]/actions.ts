"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext, getServiceRoleClient } from "@/lib/auth/server";

type MutableField =
  | "assigned_salesperson"
  | "crm_stage"
  | "crm_status"
  | "tour_requested"
  | "tour_preferred_time";

export async function updateLeadField(
  leadId: string,
  field: MutableField,
  value: string | boolean | null
) {
  const session = await getSessionContext();
  if (!session) return { ok: false, error: "Not authenticated" };

  const client = getServiceRoleClient();
  if (!client) return { ok: false, error: "Service unavailable" };

  // Record previous value for event history
  const { data: prev } = await client
    .from("leads")
    .select(field)
    .eq("id", leadId)
    .eq("organization_id", session.organizationId)
    .maybeSingle();

  const { error } = await client
    .from("leads")
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq("id", leadId)
    .eq("organization_id", session.organizationId);

  if (error) return { ok: false, error: error.message };

  // Record a lead_event for CRM changes
  if (field === "crm_stage" || field === "crm_status") {
    const from = prev
      ? ((prev as Record<string, unknown>)[field] as string | null)
      : null;
    await client.from("lead_events").insert({
      lead_id: leadId,
      event_type: field + "_change",
      payload: { from, to: value, changed_by: session.displayName },
    });
  }

  revalidatePath(`/app/conversations/${leadId}`);
  revalidatePath(`/app/conversations`);
  return { ok: true };
}
