import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/auth/server";

export async function POST(request: Request) {
  const supa = await getSupabaseServer();
  await supa.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), { status: 302 });
}
