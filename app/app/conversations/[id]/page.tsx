import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSessionContext } from "@/lib/auth/server";
import {
  getLead,
  getLeadConversations,
  getLeadEvents,
  listLeads,
  listOrgUsers,
  getFacilityBySlug,
} from "@/lib/app-data";
import { SCORE_META, formatPhone } from "@/lib/ui/brand";
import { ActivityTimeline } from "./_ActivityTimeline";
import { DetailTabs } from "./_DetailTabs";
import { SmsComposer } from "./_SmsComposer";
import { QuickJumpRail } from "./_QuickJumpRail";
import { SalespersonField } from "./_SalespersonField";

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const { id } = await params;
  const lead = await getLead(session.organizationId, id);
  if (!lead) notFound();

  const [conversations, events, allLeads, users] = await Promise.all([
    getLeadConversations(lead.id),
    getLeadEvents(lead.id),
    listLeads(session.organizationId),
    listOrgUsers(session.organizationId),
  ]);

  const facility = lead.facility_slug
    ? await getFacilityBySlug(session.organizationId, lead.facility_slug)
    : null;

  const score = lead.lead_score ?? "warm";
  const scoreMeta = SCORE_META[score];
  const showHighChanceBadge =
    (lead.move_in_score ?? 0) >= 80 || score === "urgent";

  const salespeople = [
    ...new Set(
      [
        ...users.map((u) => u.display_name as string),
        lead.assigned_salesperson,
      ].filter(Boolean) as string[]
    ),
    "Rachel Stevens",
    "Maria Rodriguez",
    "David Chen",
    "Kevin Walsh",
  ];

  return (
    <div className="flex-1 flex min-h-0">
      {/* Quick jump rail */}
      <QuickJumpRail
        currentId={lead.id}
        leads={allLeads.slice(0, 20).map((l) => ({
          id: l.id,
          name: l.visitor_name ?? "Unknown",
          score: l.lead_score ?? "warm",
          facility: l.facility_name ?? "",
        }))}
      />

      {/* Center: conversation */}
      <section className="flex-1 min-w-0 flex flex-col border-r border-gray-200 bg-white">
        <header className="px-6 pt-6 pb-4 border-b border-gray-100">
          <Link
            href="/app/conversations"
            className="text-[11px] text-gray-400 hover:text-gray-700"
          >
            ← All conversations
          </Link>
          <div className="mt-2 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-serif-display text-gray-900">
                {lead.visitor_name ?? "Unknown visitor"}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                {lead.facility_name ?? "—"} ·{" "}
                {formatPhone(lead.visitor_phone)} ·{" "}
                {lead.visitor_email ?? "no email"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {showHighChanceBadge && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                  style={{
                    backgroundColor: scoreMeta.bg,
                    borderColor: scoreMeta.border,
                    color: scoreMeta.color,
                  }}
                >
                  High chance of move-in · {lead.move_in_score ?? "—"}
                </span>
              )}
              <SalespersonField
                leadId={lead.id}
                current={lead.assigned_salesperson ?? ""}
                options={salespeople}
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <ActivityTimeline
            conversations={conversations.map((c) => ({
              id: c.id,
              role: c.role,
              content: c.content,
              created_at: c.created_at,
            }))}
            events={events.map((e) => ({
              id: e.id,
              event_type: e.event_type,
              payload: e.payload,
              created_at: e.created_at,
            }))}
          />
        </div>

        <SmsComposer
          leadName={lead.visitor_name ?? "visitor"}
          salespeople={salespeople}
        />
      </section>

      {/* Right rail: tabs */}
      <aside className="w-[360px] shrink-0 bg-gray-50 border-l border-gray-200 flex flex-col">
        <DetailTabs lead={lead} facility={facility} />
      </aside>
    </div>
  );
}
