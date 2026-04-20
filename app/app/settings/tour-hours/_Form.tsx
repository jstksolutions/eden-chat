"use client";

import { useState, useTransition } from "react";
import { saveBusinessHours } from "./actions";

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

interface Facility {
  id: string;
  name: string;
  business_hours: Record<string, { open: string; close: string }> | null;
}

function defaultHours(): Record<string, { open: string; close: string }> {
  return {
    mon: { open: "09:00", close: "17:00" },
    tue: { open: "09:00", close: "17:00" },
    wed: { open: "09:00", close: "17:00" },
    thu: { open: "09:00", close: "17:00" },
    fri: { open: "09:00", close: "17:00" },
    sat: { open: "10:00", close: "14:00" },
    sun: { open: "", close: "" },
  };
}

export function TourHoursForm({ facilities }: { facilities: Facility[] }) {
  const [selected, setSelected] = useState(facilities[0]?.id ?? "");
  const current = facilities.find((f) => f.id === selected);
  const [hours, setHours] = useState(current?.business_hours ?? defaultHours());
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [isPending, startTransition] = useTransition();

  function onFacilityChange(id: string) {
    setSelected(id);
    const f = facilities.find((x) => x.id === id);
    setHours(f?.business_hours ?? defaultHours());
    setSaveState("idle");
  }

  function setDay(key: string, field: "open" | "close", value: string) {
    setHours((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
    setSaveState("idle");
  }

  function onSave() {
    startTransition(async () => {
      await saveBusinessHours(selected, hours);
      setSaveState("saved");
    });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <label className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
          <span className="font-medium">Community:</span>
          <select
            value={selected}
            onChange={(e) => onFacilityChange(e.target.value)}
            className="bg-transparent text-gray-900 font-medium outline-none"
          >
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={onSave}
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg bg-[#1E2761] text-white text-xs font-semibold hover:bg-[#2a3478] disabled:opacity-50"
        >
          {isPending ? "Saving…" : saveState === "saved" ? "Saved ✓" : "Save"}
        </button>
      </div>

      <div className="p-6 space-y-3">
        {DAYS.map((d) => {
          const v = hours[d.key] ?? { open: "", close: "" };
          const closed = !v.open && !v.close;
          return (
            <div
              key={d.key}
              className="flex items-center gap-3 text-sm"
            >
              <span className="w-24 text-gray-700 font-medium">
                {d.label}
              </span>
              <input
                type="time"
                value={v.open}
                onChange={(e) => setDay(d.key, "open", e.target.value)}
                className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="time"
                value={v.close}
                onChange={(e) => setDay(d.key, "close", e.target.value)}
                className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white"
              />
              {closed && (
                <span className="text-[11px] text-gray-400 italic">Closed</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
