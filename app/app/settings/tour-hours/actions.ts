"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext, getServiceRoleClient } from "@/lib/auth/server";

export async function saveBusinessHours(
  facilityId: string,
  hours: Record<string, { open: string; close: string }>
) {
  const session = await getSessionContext();
  if (!session) return { ok: false };

  const client = getServiceRoleClient();
  if (!client) return { ok: false };

  await client
    .from("facilities")
    .update({ business_hours: hours, updated_at: new Date().toISOString() })
    .eq("id", facilityId)
    .eq("organization_id", session.organizationId);

  revalidatePath("/app/settings/tour-hours");
  return { ok: true };
}
