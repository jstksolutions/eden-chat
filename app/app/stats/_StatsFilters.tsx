"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useMemo } from "react";
import { CARE_TYPE_LABEL } from "@/lib/ui/brand";

interface Props {
  facilities: { id: string; name: string }[];
  trafficSources: string[];
  current: {
    facility?: string;
    care?: string;
    traffic?: string;
    days: string;
  };
}

const DAY_RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "60", label: "Last 60 days" },
  { value: "90", label: "Last 90 days" },
];

const CARE_OPTIONS = Object.keys(CARE_TYPE_LABEL);

export function StatsFilters({ facilities, trafficSources, current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  );

  function update(key: string, value: string | undefined) {
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  const hasFilters = !!(current.facility || current.care || current.traffic);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <FilterSelect
        label="Date range"
        value={current.days}
        options={DAY_RANGES}
        onChange={(v) => update("days", v === "30" ? undefined : v)}
      />
      <FilterSelect
        label="Facility"
        value={current.facility ?? ""}
        placeholder="All facilities"
        options={facilities.map((f) => ({ value: f.id, label: f.name }))}
        onChange={(v) => update("facility", v || undefined)}
      />
      <FilterSelect
        label="Care type"
        value={current.care ?? ""}
        placeholder="All care types"
        options={CARE_OPTIONS.map((c) => ({
          value: c,
          label: CARE_TYPE_LABEL[c],
        }))}
        onChange={(v) => update("care", v || undefined)}
      />
      <FilterSelect
        label="Traffic source"
        value={current.traffic ?? ""}
        placeholder="All sources"
        options={trafficSources.map((s) => ({ value: s, label: s }))}
        onChange={(v) => update("traffic", v || undefined)}
      />
      {hasFilters && (
        <button
          onClick={clearAll}
          className="text-xs text-gray-500 hover:text-gray-900 underline underline-offset-2"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
      <span className="font-medium text-gray-500">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-gray-900 font-medium outline-none"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
