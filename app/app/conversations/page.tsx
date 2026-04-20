import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionContext } from "@/lib/auth/server";
import { listFacilities, listLeads } from "@/lib/app-data";
import { PageHeader } from "../_components/PageHeader";
import { SCORE_META, CRM_STAGE_LABEL, formatCareTypes } from "@/lib/ui/brand";
import { ConversationFilters } from "./_Filters";

interface SearchParams {
  facility?: string;
  score?: string;
  stage?: string;
  q?: string;
}

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const params = await searchParams;

  const [facilities, leads] = await Promise.all([
    listFacilities(session.organizationId),
    listLeads(session.organizationId, {
      facilityId: params.facility,
      score: params.score,
      crmStage: params.stage,
      search: params.q,
    }),
  ]);

  return (
    <>
      <PageHeader
        title="All Conversations"
        subtitle="Every chat across your communities, scored and stage-tracked."
      />
      <div className="px-8 py-6 space-y-4">
        <ConversationFilters
          facilities={facilities.map((f) => ({ id: f.id, name: f.name }))}
          current={{
            facility: params.facility,
            score: params.score,
            stage: params.stage,
            q: params.q,
          }}
        />

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-200 bg-gray-50">
                  <th className="text-left font-semibold px-5 py-3">Name</th>
                  <th className="text-left font-semibold px-3 py-3">Community</th>
                  <th className="text-left font-semibold px-3 py-3">Care</th>
                  <th className="text-left font-semibold px-3 py-3">Score</th>
                  <th className="text-left font-semibold px-3 py-3">Stage</th>
                  <th className="text-left font-semibold px-3 py-3">Tour</th>
                  <th className="text-left font-semibold px-3 py-3">Last update</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-16 text-sm text-gray-400"
                    >
                      No conversations match these filters.
                    </td>
                  </tr>
                )}
                {leads.map((lead) => {
                  const score = lead.lead_score ?? "warm";
                  const meta = SCORE_META[score] ?? SCORE_META.warm;
                  return (
                    <tr
                      key={lead.id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/app/conversations/${lead.id}`}
                          className="block"
                        >
                          <p className="text-sm font-semibold text-gray-900">
                            {lead.visitor_name ?? "Unknown visitor"}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[260px]">
                            {lead.conversation_summary ?? "—"}
                          </p>
                        </Link>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-700">
                        {lead.facility_name ?? "—"}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-700">
                        {formatCareTypes(
                          lead.care_type_interest
                            ? [lead.care_type_interest]
                            : null
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
                          style={{
                            backgroundColor: meta.bg,
                            borderColor: meta.border,
                            color: meta.color,
                          }}
                        >
                          {meta.emoji} {meta.label}
                          {lead.move_in_score != null && (
                            <span className="opacity-60 font-normal ml-1">
                              {lead.move_in_score}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-[12px] text-gray-700">
                        {CRM_STAGE_LABEL[lead.crm_stage] ?? lead.crm_stage}
                      </td>
                      <td className="px-3 py-4 text-[12px]">
                        {lead.tour_requested ? (
                          <span className="text-teal-700">Requested</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-[12px] text-gray-500 whitespace-nowrap">
                        {formatRelative(lead.updated_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 pl-1">
          Showing {leads.length} of {leads.length} conversations.
        </p>
      </div>
    </>
  );
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
