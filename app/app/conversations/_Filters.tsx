"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CRM_STAGE_LABEL, SCORE_META } from "@/lib/ui/brand";

interface Props {
  facilities: { id: string; name: string }[];
  current: {
    facility?: string;
    score?: string;
    stage?: string;
    q?: string;
  };
}

export function ConversationFilters({ facilities, current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(current.q ?? "");

  const params = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  );

  function update(key: string, value: string | undefined) {
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    update("q", query.trim() || undefined);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <form onSubmit={submitSearch} className="relative">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, phone…"
          className="pl-8 pr-3 py-1.5 text-xs w-64 rounded-lg border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-[#1E2761]/20 focus:border-[#1E2761]"
        />
      </form>
      <Select
        label="Community"
        value={current.facility ?? ""}
        placeholder="All communities"
        options={facilities.map((f) => ({ value: f.id, label: f.name }))}
        onChange={(v) => update("facility", v || undefined)}
      />
      <Select
        label="Score"
        value={current.score ?? ""}
        placeholder="Any score"
        options={Object.entries(SCORE_META).map(([v, m]) => ({
          value: v,
          label: `${m.emoji} ${m.label}`,
        }))}
        onChange={(v) => update("score", v || undefined)}
      />
      <Select
        label="Stage"
        value={current.stage ?? ""}
        placeholder="Any stage"
        options={Object.entries(CRM_STAGE_LABEL)
          .filter(([v]) => v !== "none")
          .map(([v, l]) => ({ value: v, label: l }))}
        onChange={(v) => update("stage", v || undefined)}
      />
    </div>
  );
}

function Select({
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
      <span className="font-medium">{label}:</span>
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
