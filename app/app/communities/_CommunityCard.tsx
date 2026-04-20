"use client";

import Link from "next/link";
import { useState } from "react";
import { formatCareTypes, formatMoneyFromCents, formatPhone } from "@/lib/ui/brand";
import type { FacilityRow } from "@/lib/app-data";
import { toggleCommunityStatus } from "./actions";
import { EditCommunityDrawer } from "./_EditDrawer";

export function CommunityCard({ facility }: { facility: FacilityRow }) {
  const [status, setStatus] = useState(facility.status);
  const [editing, setEditing] = useState(false);

  async function toggle() {
    const next = status === "active" ? "paused" : "active";
    setStatus(next);
    await toggleCommunityStatus(facility.id, next);
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {facility.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {facility.city}, {facility.state}
            </p>
          </div>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              status === "active"
                ? "bg-teal-50 text-teal-700 border-teal-200"
                : "bg-gray-100 text-gray-500 border-gray-200"
            }`}
          >
            {status === "active" ? "Active" : "Paused"}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {facility.care_types.map((t) => (
            <span
              key={t}
              className="text-[10px] px-2 py-0.5 rounded-full bg-[#eef0fa] text-[#1E2761] font-medium"
            >
              {formatCareTypes([t])}
            </span>
          ))}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
              Starting rate
            </dt>
            <dd className="text-gray-800 mt-0.5">
              {facility.starting_rate_monthly
                ? `${formatMoneyFromCents(facility.starting_rate_monthly)}/mo`
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
              Phone
            </dt>
            <dd className="text-gray-800 mt-0.5">
              {formatPhone(facility.phone)}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex items-center gap-2">
          <Link
            href={`/app/conversations?facility=${facility.id}`}
            className="flex-1 text-center text-xs font-semibold py-2 rounded-lg bg-[#1E2761] text-white hover:bg-[#2a3478]"
          >
            View leads
          </Link>
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={() => void toggle()}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
            title={status === "active" ? "Pause" : "Activate"}
          >
            {status === "active" ? "Pause" : "Activate"}
          </button>
        </div>
      </div>

      {editing && (
        <EditCommunityDrawer
          facility={facility}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
