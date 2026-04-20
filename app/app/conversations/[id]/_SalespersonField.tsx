"use client";

import { useState, useTransition } from "react";
import { updateLeadField } from "./actions";

export function SalespersonField({
  leadId,
  current,
  options,
}: {
  leadId: string;
  current: string;
  options: string[];
}) {
  const [value, setValue] = useState(current);
  const [isPending, startTransition] = useTransition();

  function save(next: string) {
    setValue(next);
    startTransition(async () => {
      await updateLeadField(leadId, "assigned_salesperson", next);
    });
  }

  return (
    <label className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1">
      <span className="font-medium">Owner:</span>
      <select
        value={value}
        onChange={(e) => save(e.target.value)}
        disabled={isPending}
        className="bg-transparent text-gray-900 font-medium outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
