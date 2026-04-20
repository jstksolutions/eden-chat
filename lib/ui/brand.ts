// Eden product palette. Intentionally distinct from TalkFurther.
export const BRAND = {
  primary: "#1E2761",
  primaryHover: "#2a3478",
  primarySoft: "#eef0fa",
  accent: "#0fb5a6",
  accentSoft: "#ccfbf1",
  badgeBg: "#f0fdfa",
  badgeText: "#0f766e",
  badgeBorder: "#99f6e4",
  scoreUrgent: "#dc2626",
  scoreHot: "#ea580c",
  scoreWarm: "#ca8a04",
  scoreCold: "#64748b",
} as const;

export const CARE_TYPE_LABEL: Record<string, string> = {
  assisted_living: "Assisted Living",
  memory_care: "Memory Care",
  independent_living: "Independent Living",
  skilled_nursing: "Skilled Nursing",
  respite: "Respite",
};

export function formatCareTypes(types: string[] | null | undefined): string {
  if (!types?.length) return "—";
  return types.map((t) => CARE_TYPE_LABEL[t] ?? t).join(" · ");
}

export function formatMoneyFromCents(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return `$${(cents / 100).toLocaleString("en-US")}`;
}

export function formatPhone(raw: string | null | undefined): string {
  if (!raw) return "—";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

export const SCORE_META: Record<
  string,
  { label: string; color: string; bg: string; border: string; emoji: string }
> = {
  urgent: {
    label: "Urgent",
    color: "#b91c1c",
    bg: "#fef2f2",
    border: "#fecaca",
    emoji: "🔴",
  },
  hot: {
    label: "Hot",
    color: "#c2410c",
    bg: "#fff7ed",
    border: "#fed7aa",
    emoji: "🟠",
  },
  warm: {
    label: "Warm",
    color: "#a16207",
    bg: "#fefce8",
    border: "#fde68a",
    emoji: "🟡",
  },
  cold: {
    label: "Cold",
    color: "#475569",
    bg: "#f1f5f9",
    border: "#cbd5e1",
    emoji: "⚪",
  },
};

export const CRM_STAGE_LABEL: Record<string, string> = {
  none: "No stage",
  inquiry: "Inquiry",
  pre_tour: "Pre-Tour",
  tour_scheduled: "Tour Scheduled",
  tour_completed: "Tour Completed",
  tour_missed: "Tour Missed",
  move_in: "Move-In",
  closed_lost: "Closed Lost",
};

export const CRM_STATUS_LABEL: Record<string, string> = {
  open: "Open",
  closed: "Closed",
  closed_won: "Closed — Won",
  closed_lost: "Closed — Lost",
};
