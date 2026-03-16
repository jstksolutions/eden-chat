// Browser-side Supabase client with auth session persistence.
// This is intentionally separate from lib/db/supabase.ts, which disables
// persistSession so it can safely run in Edge workers. This client is only
// ever imported in "use client" components.

import { createBrowserClient } from "@supabase/ssr";

export function createAuthClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
