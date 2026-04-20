import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Profile" };

export default async function SettingsProfilePage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-xl">
      <h2 className="text-base font-semibold text-gray-900">Profile</h2>
      <p className="text-xs text-gray-500 mt-0.5">
        Your Eden Chat account.
      </p>
      <dl className="mt-5 space-y-3">
        <Row label="Display name" value={session.displayName} />
        <Row label="Email" value={session.email} />
        <Row label="Role" value={formatRole(session.role)} />
        <Row label="Organization" value={session.organizationName} />
      </dl>
      <p className="mt-5 text-[11px] text-gray-400">
        Profile edits ship in Phase 2 alongside the team-management UI.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <dt className="w-32 text-[11px] uppercase tracking-wider text-gray-400 font-semibold pt-0.5">
        {label}
      </dt>
      <dd className="text-sm text-gray-900 flex-1">{value}</dd>
    </div>
  );
}

function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
