// Left-nav definition. `live: true` items are functional; others render a
// Phase 2 stub page.
export interface NavItem {
  href: string;
  label: string;
  live: boolean;
  phase?: "Phase 2" | "Phase 3";
  description?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { href: "/app/stats", label: "Stats", live: true },
      {
        href: "/app/ai-insights",
        label: "AI Insights",
        live: false,
        phase: "Phase 2",
        description: "Narrative analytics over your conversation corpus.",
      },
    ],
  },
  {
    label: "Acquisition",
    items: [
      { href: "/app/web-assistant", label: "Web Assistant", live: true },
      {
        href: "/app/static-webforms",
        label: "Static Webforms",
        live: false,
        phase: "Phase 2",
        description: "Replace legacy web forms with chatbot-equivalent capture.",
      },
      {
        href: "/app/landing-pages",
        label: "Landing Pages",
        live: false,
        phase: "Phase 2",
        description: "Facility-specific landing pages with integrated chat.",
      },
      {
        href: "/app/ai-agents",
        label: "AI Agents",
        live: false,
        phase: "Phase 2",
        description: "Multi-modal AI agents including voice.",
      },
    ],
  },
  {
    label: "Engagement",
    items: [
      { href: "/app/conversations", label: "All Conversations", live: true },
      {
        href: "/app/phone-calls",
        label: "Phone Calls",
        live: false,
        phase: "Phase 2",
        description:
          "Phone tracking delivers in Phase 2, weeks 3–4. Every inbound call per DID is recorded, transcribed, summarized, scored, and lands in this view alongside web leads.",
      },
      {
        href: "/app/messaging",
        label: "Messaging",
        live: false,
        phase: "Phase 2",
        description: "Outbound SMS, drip sequences, re-engagement.",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/app/communities", label: "All Communities", live: true },
      {
        href: "/app/job-applicants",
        label: "Job Applicants",
        live: false,
        phase: "Phase 3",
        description: "Careers funnel. Not in current scope.",
      },
      { href: "/app/settings", label: "Settings", live: true },
    ],
  },
];

export interface SettingsItem {
  href: string;
  label: string;
  live: boolean;
  phase?: "Phase 2" | "Phase 3";
  description?: string;
}

export const SETTINGS_ITEMS: SettingsItem[] = [
  { href: "/app/settings", label: "Profile", live: true },
  { href: "/app/settings/users", label: "Users & Permissions", live: true },
  { href: "/app/settings/tour-hours", label: "Tour Availability", live: true },
  {
    href: "/app/settings/move-in-upload",
    label: "Move-In Upload",
    live: false,
    phase: "Phase 2",
    description: "Batch ingest historical CRM data from WelcomeHome or CSV.",
  },
  {
    href: "/app/settings/amenities",
    label: "Amenities",
    live: false,
    phase: "Phase 2",
    description: "Manage facility amenity catalog shared across communities.",
  },
  {
    href: "/app/settings/campaigns",
    label: "Campaigns",
    live: false,
    phase: "Phase 2",
    description: "Configure outbound campaigns and drip sequences.",
  },
  {
    href: "/app/settings/marketing-email",
    label: "Marketing Email",
    live: false,
    phase: "Phase 2",
  },
  {
    href: "/app/settings/email-suppression",
    label: "Email Suppression List",
    live: false,
    phase: "Phase 2",
  },
  {
    href: "/app/settings/google-ads",
    label: "Google Ads",
    live: false,
    phase: "Phase 2",
  },
  {
    href: "/app/settings/qualifying-leads",
    label: "Qualifying Leads",
    live: false,
    phase: "Phase 2",
  },
  {
    href: "/app/settings/unqualified-filter",
    label: "Unqualified Lead Filter",
    live: false,
    phase: "Phase 2",
  },
  {
    href: "/app/settings/content-hub",
    label: "Content Hub",
    live: false,
    phase: "Phase 2",
  },
  {
    href: "/app/settings/vsa-banner",
    label: "VSA Banner",
    live: false,
    phase: "Phase 2",
  },
];

export function getNavItemByHref(href: string): NavItem | null {
  for (const g of NAV_GROUPS) {
    for (const item of g.items) {
      if (item.href === href) return item;
    }
  }
  return null;
}
