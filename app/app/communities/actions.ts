"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext, getServiceRoleClient } from "@/lib/auth/server";

export async function toggleCommunityStatus(
  facilityId: string,
  status: "active" | "paused" | "archived"
) {
  const session = await getSessionContext();
  if (!session) return { ok: false };

  const client = getServiceRoleClient();
  if (!client) return { ok: false };

  await client
    .from("facilities")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", facilityId)
    .eq("organization_id", session.organizationId);

  revalidatePath("/app/communities");
  return { ok: true };
}

export interface UpdateCommunityInput {
  id: string;
  name: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  care_types: string[];
  starting_rate_monthly: number | null;
  amenities: string[];
}

export async function updateCommunity(input: UpdateCommunityInput) {
  const session = await getSessionContext();
  if (!session) return { ok: false, error: "Not authenticated" };

  const client = getServiceRoleClient();
  if (!client) return { ok: false, error: "Service unavailable" };

  const { error } = await client
    .from("facilities")
    .update({
      name: input.name.trim(),
      city: input.city.trim() || null,
      state: input.state.trim() || null,
      zip: input.zip.trim() || null,
      phone: input.phone.trim() || null,
      email: input.email.trim() || null,
      care_types: input.care_types,
      starting_rate_monthly: input.starting_rate_monthly,
      amenities: input.amenities,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .eq("organization_id", session.organizationId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/app/communities");
  return { ok: true };
}
