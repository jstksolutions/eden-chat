import type { LeadRow } from "@/lib/db/supabase";

export type LeadScore = "urgent" | "hot" | "warm" | "cold";

/**
 * Scores a lead into one of four tiers based on urgency signals.
 * Priority is applied top-down — first match wins.
 *
 *  urgent → discharge planner referral OR immediate placement need
 *  hot    → hospital setting OR placement needed within the week
 *  warm   → timeline within a month OR any care type interest captured
 *  cold   → everything else (early research, no timeline)
 */
export function scoreLead(lead: LeadRow): LeadScore {
  const timeline = lead.timeline?.toLowerCase() ?? "";
  const situation = lead.current_situation?.toLowerCase() ?? "";
  const audience = lead.audience_type?.toLowerCase() ?? "";

  // Tier 1 — Urgent
  if (audience === "professional" || timeline === "immediate") {
    return "urgent";
  }

  // Tier 2 — Hot
  if (timeline.includes("week") || situation.includes("hospital")) {
    return "hot";
  }

  // Tier 3 — Warm
  if (timeline.includes("month") || !!lead.care_type_interest?.trim()) {
    return "warm";
  }

  // Tier 4 — Cold
  return "cold";
}

export const SCORE_LABELS: Record<LeadScore, string> = {
  urgent: "Urgent",
  hot: "Hot",
  warm: "Warm",
  cold: "Cold",
};

export const SCORE_COLORS: Record<
  LeadScore,
  { bg: string; text: string; border: string; dot: string }
> = {
  urgent: { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    dot: "bg-red-500"    },
  hot:    { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
  warm:   { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", dot: "bg-yellow-500" },
  cold:   { bg: "bg-gray-50",   text: "text-gray-600",   border: "border-gray-200",   dot: "bg-gray-400"   },
};

export const SCORE_EMOJI: Record<LeadScore, string> = {
  urgent: "🔴",
  hot:    "🟠",
  warm:   "🟡",
  cold:   "⚫",
};
