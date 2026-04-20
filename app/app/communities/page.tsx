import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/server";
import { listFacilities } from "@/lib/app-data";
import { PageHeader } from "../_components/PageHeader";
import { CommunityCard } from "./_CommunityCard";

export const metadata: Metadata = { title: "Communities" };

export default async function CommunitiesPage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const facilities = await listFacilities(session.organizationId);

  return (
    <>
      <PageHeader
        title="All Communities"
        subtitle={`${facilities.length} Eden communities across your portfolio.`}
        actions={
          <button
            disabled
            title="Phase 2: add new community from here"
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed"
          >
            + Add Community
          </button>
        }
      />
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map((f) => (
            <CommunityCard key={f.id} facility={f} />
          ))}
        </div>
      </div>
    </>
  );
}
