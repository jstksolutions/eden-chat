import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client bound to the current request cookies. Use in
// Server Components and Route Handlers to get the authenticated user.
export async function getSupabaseServer(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — cookies are read-only there.
            // Middleware already refreshed the session, so this is safe to ignore.
          }
        },
      },
    }
  );
}

// Service-role client for trusted server-side reads that bypass RLS. Use only
// when you need cross-tenant visibility (e.g. seeded demo content).
export function getServiceRoleClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export interface SessionContext {
  userId: string;
  email: string;
  displayName: string;
  role: "owner" | "admin" | "regional" | "sales" | "viewer";
  organizationId: string;
  organizationName: string;
}

export async function getSessionContext(): Promise<SessionContext | null> {
  const supa = await getSupabaseServer();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supa
    .from("user_profiles")
    .select("display_name, role, organization_id, organizations(name)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) return null;

  // PostgREST joins return an array for the related table even with a single
  // row. Flatten defensively.
  const orgField = profile.organizations as
    | { name: string }
    | { name: string }[]
    | null;
  const orgName = Array.isArray(orgField)
    ? orgField[0]?.name ?? ""
    : orgField?.name ?? "";

  return {
    userId: user.id,
    email: user.email ?? "",
    displayName: profile.display_name ?? user.email ?? "",
    role: profile.role as SessionContext["role"],
    organizationId: profile.organization_id as string,
    organizationName: orgName,
  };
}
