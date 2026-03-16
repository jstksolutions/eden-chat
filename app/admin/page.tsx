"use client";

// ── Eden Care Assistant — Leads Dashboard ─────────────────────────────────────
//
// NOTE: No authentication is implemented here — this is a demo-phase admin
// panel. Phase 2 will add Supabase Auth (magic link or SSO) before this is
// shared with facility staff.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ChevronDown, ChevronUp, Calendar, LogOut, ArrowLeft } from "lucide-react";
import { createAuthClient } from "@/lib/auth/supabase-auth";
import {
  SCORE_LABELS,
  SCORE_COLORS,
  SCORE_EMOJI,
  type LeadScore,
} from "@/lib/leads/scoring";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Lead {
  id: string;
  session_id: string;
  facility_id: string;
  facility_name: string | null;
  visitor_name: string | null;
  visitor_phone: string | null;
  visitor_email: string | null;
  patient_name: string | null;
  patient_relationship: string | null;
  care_type_interest: string | null;
  current_situation: string | null;
  insurance_type: string | null;
  timeline: string | null;
  hospital_name: string | null;
  referral_source: string | null;
  audience_type: string | null;
  conversation_summary: string | null;
  lead_score: LeadScore | null;
  tour_requested: boolean | null;
  tour_preferred_time: string | null;
  created_at: string;
  updated_at: string;
}

// ── Score badge ────────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: LeadScore | null }) {
  const s = (score ?? "cold") as LeadScore;
  const c = SCORE_COLORS[s];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {SCORE_LABELS[s]}
    </span>
  );
}

// ── Expanded detail panel ──────────────────────────────────────────────────────

function DetailPanel({ lead }: { lead: Lead }) {
  function field(label: string, value: string | null | undefined | boolean) {
    if (value === null || value === undefined || value === "") return null;
    const display =
      typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
    return (
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-800 mt-0.5 break-words">{display}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border-t border-gray-200 px-6 py-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
        {/* Visitor */}
        {field("Visitor Name", lead.visitor_name)}
        {field("Phone", lead.visitor_phone)}
        {field("Email", lead.visitor_email)}
        {field("Visitor Type", lead.audience_type)}

        {/* Patient */}
        {field("Patient", lead.patient_name)}
        {field("Relationship", lead.patient_relationship)}

        {/* Care context */}
        {field("Care Interest", lead.care_type_interest)}
        {field("Current Situation", lead.current_situation)}
        {field("Insurance", lead.insurance_type)}
        {field("Timeline", lead.timeline)}
        {field("Hospital", lead.hospital_name)}
        {field("Referral Source", lead.referral_source)}

        {/* Tour */}
        {field("Tour Requested", lead.tour_requested)}
        {field("Tour Preferred Time", lead.tour_preferred_time)}

        {/* Meta */}
        {field("Lead Score", lead.lead_score ? `${SCORE_EMOJI[lead.lead_score]} ${SCORE_LABELS[lead.lead_score]}` : null)}
        {field("Facility", lead.facility_name)}
        {field("Session ID", lead.session_id)}
        {field("Created", new Date(lead.created_at).toLocaleString("en-US", {
          dateStyle: "medium", timeStyle: "short",
        }))}
      </div>

      {/* Conversation summary */}
      {lead.conversation_summary && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide mb-1">
            Conversation Summary
          </p>
          <p className="text-sm text-blue-900 leading-relaxed">{lead.conversation_summary}</p>
        </div>
      )}
    </div>
  );
}

// ── Date filter helpers ────────────────────────────────────────────────────────

type DateFilter = "today" | "7d" | "30d" | "all";

function passesDateFilter(lead: Lead, filter: DateFilter): boolean {
  if (filter === "all") return true;
  const created = new Date(lead.created_at).getTime();
  const now = Date.now();
  const day = 86_400_000;
  if (filter === "today") return created > now - day;
  if (filter === "7d") return created > now - 7 * day;
  if (filter === "30d") return created > now - 30 * day;
  return true;
}

// ── Main Page ──────────────────────────────────────────────────────────────────

const ALL_SCORES: LeadScore[] = ["urgent", "hot", "warm", "cold"];
const EDEN_GREEN = "#2E5A3A";

export default function AdminPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Filters
  const [facilityFilter, setFacilityFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState<Set<LeadScore>>(new Set(ALL_SCORES));
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  // Expanded row
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/leads");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Lead[];
      setLeads(data);
      setError(null);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load current user email
  useEffect(() => {
    const supabase = createAuthClient();
    void supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  async function handleSignOut() {
    const supabase = createAuthClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Initial load + auto-refresh every 30s
  useEffect(() => {
    void fetchLeads();
    const interval = setInterval(() => void fetchLeads(), 30_000);
    return () => clearInterval(interval);
  }, [fetchLeads]);

  // Unique facilities for dropdown
  const facilityOptions = useMemo(() => {
    const names = Array.from(
      new Set(leads.map((l) => l.facility_name).filter(Boolean))
    ) as string[];
    return names.sort();
  }, [leads]);

  // Filtered leads
  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (facilityFilter !== "all" && l.facility_name !== facilityFilter) return false;
      const score = (l.lead_score ?? "cold") as LeadScore;
      if (!scoreFilter.has(score)) return false;
      if (!passesDateFilter(l, dateFilter)) return false;
      return true;
    });
  }, [leads, facilityFilter, scoreFilter, dateFilter]);

  // Stats
  const stats = useMemo(() => {
    const counts: Record<LeadScore, number> = { urgent: 0, hot: 0, warm: 0, cold: 0 };
    for (const l of leads) {
      const s = (l.lead_score ?? "cold") as LeadScore;
      counts[s]++;
    }
    return counts;
  }, [leads]);

  function toggleScore(score: LeadScore) {
    setScoreFilter((prev) => {
      const next = new Set(prev);
      if (next.has(score)) {
        if (next.size === 1) return next; // always keep at least one selected
        next.delete(score);
      } else {
        next.add(score);
      }
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a
              href="/demo"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors mr-1"
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Setup</span>
            </a>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: EDEN_GREEN }}
            >
              <span className="text-white text-xs font-bold">E</span>
            </div>
            <div>
              <span className="font-bold text-gray-800 text-sm">Eden Care Assistant</span>
              <span className="text-gray-400 text-sm"> — Leads Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">
              Auto-refreshes every 30s · Last: {lastRefresh.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </span>
            <button
              onClick={() => { setLoading(true); void fetchLeads(); }}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            {userEmail && (
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-200">
                <span className="text-xs text-gray-500 max-w-[160px] truncate">{userEmail}</span>
                <button
                  onClick={() => void handleSignOut()}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                  title="Sign out"
                >
                  <LogOut size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Mobile sign-out (desktop version is in header) */}
        {userEmail && (
          <div className="sm:hidden flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5">
            <span className="text-xs text-gray-500 truncate">{userEmail}</span>
            <button
              onClick={() => void handleSignOut()}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors"
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        )}

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 col-span-1">
            <p className="text-xs text-gray-400 font-medium">Total Leads</p>
            <p className="text-2xl font-bold text-gray-800 mt-0.5">{leads.length}</p>
          </div>
          {ALL_SCORES.map((score) => {
            const c = SCORE_COLORS[score];
            return (
              <div
                key={score}
                className={`rounded-xl border px-4 py-3 ${c.bg} ${c.border}`}
              >
                <p className={`text-xs font-medium ${c.text} flex items-center gap-1`}>
                  {SCORE_EMOJI[score]} {SCORE_LABELS[score]}
                </p>
                <p className={`text-2xl font-bold mt-0.5 ${c.text}`}>{stats[score]}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-wrap items-center gap-4">
          {/* Facility */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">Facility:</label>
            <div className="relative">
              <select
                value={facilityFilter}
                onChange={(e) => setFacilityFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-7 py-1.5 text-sm text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All facilities</option>
                {facilityOptions.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Score chips */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Urgency:</span>
            <div className="flex gap-1.5">
              {ALL_SCORES.map((score) => {
                const c = SCORE_COLORS[score];
                const active = scoreFilter.has(score);
                return (
                  <button
                    key={score}
                    onClick={() => toggleScore(score)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                      active
                        ? `${c.bg} ${c.text} ${c.border}`
                        : "bg-white text-gray-400 border-gray-200"
                    }`}
                  >
                    {SCORE_EMOJI[score]} {SCORE_LABELS[score]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs text-gray-500">Period:</label>
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-7 py-1.5 text-sm text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            Error loading leads: {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading && leads.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw size={20} className="animate-spin text-gray-400 mr-2" />
              <span className="text-sm text-gray-400">Loading leads…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-sm font-semibold text-gray-700">No leads captured yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Start a conversation on the demo page to see leads appear here. Leads populate in real time as visitors interact with the chat widget.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {["Urgency", "Facility", "Name", "Phone", "Care Type", "Timeline", "Audience", "Summary", "Time"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => {
                    const isExpanded = expandedId === lead.id;
                    return (
                      <>
                        <tr
                          key={lead.id}
                          onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          {/* Urgency */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <ScoreBadge score={lead.lead_score} />
                          </td>

                          {/* Facility */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-xs font-medium text-gray-700">
                              {lead.facility_name ?? "—"}
                            </span>
                          </td>

                          {/* Name */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-medium text-gray-800">
                              {lead.visitor_name ?? <span className="text-gray-400 font-normal">Unknown</span>}
                            </span>
                            {lead.tour_requested && (
                              <span className="ml-1.5" title={`Tour: ${lead.tour_preferred_time ?? "TBD"}`}>
                                <Calendar size={13} className="inline text-blue-500" />
                              </span>
                            )}
                          </td>

                          {/* Phone */}
                          <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                            {lead.visitor_phone ?? <span className="text-gray-300">—</span>}
                          </td>

                          {/* Care type */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-xs text-gray-600">
                              {lead.care_type_interest ?? <span className="text-gray-300">—</span>}
                            </span>
                          </td>

                          {/* Timeline */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-xs text-gray-600">
                              {lead.timeline ?? <span className="text-gray-300">—</span>}
                            </span>
                          </td>

                          {/* Audience */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-xs text-gray-600 capitalize">
                              {lead.audience_type ?? <span className="text-gray-300">—</span>}
                            </span>
                          </td>

                          {/* Summary */}
                          <td className="px-4 py-3 max-w-xs">
                            <span className="text-xs text-gray-500 line-clamp-1">
                              {lead.conversation_summary ?? <span className="text-gray-300">—</span>}
                            </span>
                          </td>

                          {/* Timestamp */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-xs text-gray-400">
                              {new Date(lead.created_at).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="ml-2 text-gray-300">
                              {isExpanded ? <ChevronUp size={12} className="inline" /> : <ChevronDown size={12} className="inline" />}
                            </span>
                          </td>
                        </tr>

                        {/* Expanded detail row */}
                        {isExpanded && (
                          <tr key={`${lead.id}-detail`}>
                            <td colSpan={9} className="p-0">
                              <DetailPanel lead={lead} />
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>

              {/* Row count */}
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
                Showing {filtered.length} of {leads.length} lead{leads.length !== 1 ? "s" : ""}
                {filtered.length !== leads.length && " (filtered)"}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
