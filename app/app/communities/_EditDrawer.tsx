"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import type { FacilityRow } from "@/lib/app-data";
import { CARE_TYPE_LABEL } from "@/lib/ui/brand";
import { updateCommunity } from "./actions";

const inputCls =
  "w-full px-3 py-2 text-[13px] rounded-lg border border-gray-200 bg-white outline-none focus:border-[#1E2761] focus:ring-2 focus:ring-[#1E2761]/10";

export function EditCommunityDrawer({
  facility,
  onClose,
}: {
  facility: FacilityRow;
  onClose: () => void;
}) {
  const [name, setName] = useState(facility.name);
  const [city, setCity] = useState(facility.city ?? "");
  const [stateCode, setStateCode] = useState(facility.state ?? "");
  const [zip, setZip] = useState(facility.zip ?? "");
  const [phone, setPhone] = useState(facility.phone ?? "");
  const [email, setEmail] = useState(facility.email ?? "");
  const [careTypes, setCareTypes] = useState<string[]>(facility.care_types);
  const [rateDollars, setRateDollars] = useState(
    facility.starting_rate_monthly
      ? Math.round(facility.starting_rate_monthly / 100).toString()
      : ""
  );
  const [amenitiesCsv, setAmenitiesCsv] = useState(
    facility.amenities.join(", ")
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggleCare(t: string) {
    setCareTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function save() {
    setError(null);
    const rate = rateDollars.trim() ? parseInt(rateDollars, 10) * 100 : null;
    const amenities = amenitiesCsv
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    startTransition(async () => {
      const result = await updateCommunity({
        id: facility.id,
        name,
        city,
        state: stateCode,
        zip,
        phone,
        email,
        care_types: careTypes,
        starting_rate_monthly: rate,
        amenities,
      });
      if (!result.ok) {
        setError(result.error ?? "Failed to save");
        return;
      }
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-white shadow-xl overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Edit Community
            </h2>
            <p className="text-xs text-gray-500 font-mono">{facility.slug}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 flex-1">
          <Field label="Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="City">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="State">
              <input
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value.toUpperCase())}
                maxLength={2}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="ZIP">
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Phone">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Care types">
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(CARE_TYPE_LABEL).map(([v, l]) => {
                const active = careTypes.includes(v);
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => toggleCare(v)}
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      active
                        ? "bg-[#1E2761] text-white border-[#1E2761]"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Starting rate (USD/month)">
            <input
              type="number"
              min={0}
              value={rateDollars}
              onChange={(e) => setRateDollars(e.target.value)}
              className={inputCls}
              placeholder="4500"
            />
          </Field>

          <Field label="Amenities (comma separated)">
            <textarea
              value={amenitiesCsv}
              onChange={(e) => setAmenitiesCsv(e.target.value)}
              rows={3}
              className={inputCls}
            />
          </Field>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="px-5 py-4 border-t border-gray-200 sticky bottom-0 bg-white flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={isPending}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#1E2761] text-white hover:bg-[#2a3478] disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
