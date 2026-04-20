import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/server";
import { listOrgUsers } from "@/lib/app-data";

const ROLE_DESCRIPTION: Record<string, string> = {
  owner: "Full account owner — billing, settings, org-level config.",
  admin: "Manage communities, users, and settings.",
  regional: "View leads across multiple communities.",
  sales: "Work leads assigned to their community.",
  viewer: "Read-only access.",
};

export default async function UsersPage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const users = await listOrgUsers(session.organizationId);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-3xl">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Users & Permissions
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {users.length} team member{users.length === 1 ? "" : "s"}.
          </p>
        </div>
        <button
          disabled
          title="Phase 2: invite users via SSO or magic link"
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed"
        >
          + Invite
        </button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-200 bg-gray-50">
            <th className="text-left font-semibold px-5 py-3">Member</th>
            <th className="text-left font-semibold px-3 py-3">Role</th>
            <th className="text-left font-semibold px-3 py-3">Scope</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.user_id as string}
              className="border-b border-gray-100 last:border-b-0"
            >
              <td className="px-5 py-3">
                <p className="text-sm font-semibold text-gray-900">
                  {u.display_name as string}
                </p>
              </td>
              <td className="px-3 py-3">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#1E2761]">
                  {u.role as string}
                </span>
              </td>
              <td className="px-3 py-3 text-xs text-gray-500">
                {ROLE_DESCRIPTION[u.role as string] ?? ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
