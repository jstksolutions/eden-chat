import { getSupabaseClient } from "@/lib/db/supabase";

export const runtime = "edge";

export async function GET(): Promise<Response> {
  const db = getSupabaseClient();
  if (!db) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data, error } = await db
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data ?? []), {
    headers: {
      "Content-Type": "application/json",
      // Short cache — dashboard auto-refreshes every 30s
      "Cache-Control": "no-store",
    },
  });
}
