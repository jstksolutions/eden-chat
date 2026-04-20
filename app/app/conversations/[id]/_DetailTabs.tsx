"use client";

import { useState } from "react";
import { Building2, Info, Settings, List } from "lucide-react";
import {
  CRM_STAGE_LABEL,
  CRM_STATUS_LABEL,
  SCORE_META,
  formatCareTypes,
  formatMoneyFromCents,
  formatPhone,
} from "@/lib/ui/brand";
import type { LeadRow, FacilityRow } from "@/lib/app-data";
import { updateLeadField } from "./actions";
import { LocationMap } from "./_LocationMap";

type Tab = "community" | "details" | "processing" | "lists";

export function DetailTabs({
  lead,
  facility,
}: {
  lead: LeadRow;
  facility: FacilityRow | null;
}) {
  const [tab, setTab] = useState<Tab>("community");

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <nav className="px-4 pt-3 border-b border-gray-200 bg-white flex items-center gap-1">
        <TabBtn
          active={tab === "community"}
          onClick={() => setTab("community")}
          icon={Building2}
          label="Community"
        />
        <TabBtn
          active={tab === "details"}
          onClick={() => setTab("details")}
          icon={Info}
          label="Details"
        />
        <TabBtn
          active={tab === "processing"}
          onClick={() => setTab("processing")}
          icon={Settings}
          label="Processing"
        />
        <TabBtn
          active={tab === "lists"}
          onClick={() => setTab("lists")}
          icon={List}
          label="Lists"
        />
      </nav>
      <div className="flex-1 overflow-y-auto">
        {tab === "community" && <CommunityPanel facility={facility} />}
        {tab === "details" && <DetailsPanel lead={lead} />}
        {tab === "processing" && <ProcessingPanel lead={lead} />}
        {tab === "lists" && <ListsPanel />}
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Building2;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium border-b-2 transition-colors ${
        active
          ? "border-[#1E2761] text-[#1E2761]"
          : "border-transparent text-gray-500 hover:text-gray-900"
      }`}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

function CommunityPanel({ facility }: { facility: FacilityRow | null }) {
  if (!facility) {
    return (
      <div className="p-5 text-sm text-gray-400 italic">
        No community linked to this lead.
      </div>
    );
  }
  return (
    <div className="p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{facility.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {facility.city}, {facility.state} {facility.zip}
        </p>
      </div>
      <DL>
        <DLItem label="Phone" value={formatPhone(facility.phone)} />
        <DLItem label="Email" value={facility.email ?? "—"} />
        <DLItem
          label="Care types"
          value={formatCareTypes(facility.care_types)}
        />
        <DLItem
          label="Starting rate"
          value={
            facility.starting_rate_monthly
              ? `${formatMoneyFromCents(facility.starting_rate_monthly)}/mo`
              : "Contact admissions"
          }
        />
        {facility.amenities.length > 0 && (
          <DLItem
            label="Amenities"
            value={facility.amenities.slice(0, 6).join(" · ")}
          />
        )}
      </DL>
    </div>
  );
}

function DetailsPanel({ lead }: { lead: LeadRow }) {
  const scoreMeta = SCORE_META[lead.lead_score ?? "warm"];
  return (
    <div className="p-5 space-y-5">
      <section>
        <SectionTitle>Technical Details</SectionTitle>
        <DL>
          <DLItem label="Lead source" value={lead.referral_source ?? "—"} />
          <DLItem
            label="Move-in score"
            value={
              lead.move_in_score != null
                ? `${lead.move_in_score}/100 · ${scoreMeta.label}`
                : "—"
            }
          />
          <DLItem label="Referrer" value={lead.referrer ?? "—"} />
          <DLItem label="Traffic source" value={lead.traffic_source ?? "—"} />
          <DLItem label="IP address" value={lead.ip_address ?? "—"} />
          <DLItem label="Browser" value={lead.browser ?? "—"} />
          <DLItem
            label="Location"
            value={
              lead.city || lead.state
                ? `${lead.city ?? ""}${lead.city && lead.state ? ", " : ""}${
                    lead.state ?? ""
                  } ${lead.zip ?? ""}`
                : "—"
            }
          />
        </DL>
      </section>

      <section>
        <SectionTitle>Visited Pages</SectionTitle>
        <p className="text-[12px] text-gray-500">
          Captured from <span className="font-mono text-[11px]">page_view</span>{" "}
          events in the conversation timeline.
        </p>
      </section>

      <section>
        <SectionTitle>Map</SectionTitle>
        <LocationMap city={lead.city} state={lead.state} />
      </section>
    </div>
  );
}

function ProcessingPanel({ lead }: { lead: LeadRow }) {
  const [stage, setStage] = useState(lead.crm_stage);
  const [status, setStatus] = useState(lead.crm_status);
  const [tourRequested, setTourRequested] = useState(lead.tour_requested);

  async function save<F extends keyof typeof updaters>(
    field: F,
    value: string | boolean
  ) {
    await updaters[field](lead.id, value);
  }

  const updaters = {
    crm_stage: (id: string, v: string | boolean) =>
      updateLeadField(id, "crm_stage", v as string),
    crm_status: (id: string, v: string | boolean) =>
      updateLeadField(id, "crm_status", v as string),
    tour_requested: (id: string, v: string | boolean) =>
      updateLeadField(id, "tour_requested", !!v),
  };

  return (
    <div className="p-5 space-y-5">
      <section>
        <SectionTitle>CRM</SectionTitle>
        <FieldRow label="Stage">
          <select
            value={stage}
            onChange={(e) => {
              const v = e.target.value as typeof stage;
              setStage(v);
              void save("crm_stage", v);
            }}
            className="w-full text-xs px-2 py-1.5 rounded border border-gray-200 bg-white"
          >
            {Object.entries(CRM_STAGE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </FieldRow>
        <FieldRow label="Status">
          <select
            value={status}
            onChange={(e) => {
              const v = e.target.value as typeof status;
              setStatus(v);
              void save("crm_status", v);
            }}
            className="w-full text-xs px-2 py-1.5 rounded border border-gray-200 bg-white"
          >
            {Object.entries(CRM_STATUS_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </FieldRow>
      </section>

      <section>
        <SectionTitle>Tour</SectionTitle>
        <FieldRow label="Requested">
          <label className="inline-flex items-center gap-1.5 text-xs text-gray-700">
            <input
              type="checkbox"
              checked={tourRequested}
              onChange={(e) => {
                setTourRequested(e.target.checked);
                void save("tour_requested", e.target.checked);
              }}
            />
            Tour requested
          </label>
        </FieldRow>
        <FieldRow label="Preferred time">
          <p className="text-xs text-gray-900">
            {lead.tour_preferred_time
              ? new Date(lead.tour_preferred_time).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "—"}
          </p>
        </FieldRow>
      </section>

      <section>
        <SectionTitle>Move-in</SectionTitle>
        <FieldRow label="Move-in date">
          <p className="text-xs text-gray-500 italic">
            Captured when CRM stage moves to{" "}
            <span className="font-semibold">Move-In</span>.
          </p>
        </FieldRow>
      </section>
    </div>
  );
}

function ListsPanel() {
  return (
    <div className="p-5">
      <SectionTitle>Lead Lists</SectionTitle>
      <div className="bg-white rounded-lg border border-gray-200 px-4 py-6 text-center">
        <p className="text-xs text-gray-500">
          This lead is in <span className="font-semibold">no lists</span>.
        </p>
        <span className="inline-flex items-center gap-1 mt-3 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
          Ships in Phase 2
        </span>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
      {children}
    </p>
  );
}

function DL({ children }: { children: React.ReactNode }) {
  return <dl className="space-y-2">{children}</dl>;
}

function DLItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
        {label}
      </dt>
      <dd className="text-[13px] text-gray-800 mt-0.5">{value}</dd>
    </div>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
