"use client";

import { useState } from "react";
import { Info } from "lucide-react";

const REMIND_OPTIONS = [
  { value: "", label: "No reminder" },
  { value: "15m", label: "Remind in 15 min" },
  { value: "1h", label: "Remind in 1 hour" },
  { value: "1d", label: "Remind tomorrow" },
];

export function SmsComposer({
  leadName,
  salespeople,
}: {
  leadName: string;
  salespeople: string[];
}) {
  const [text, setText] = useState("");
  const [sendFrom, setSendFrom] = useState(salespeople[0] ?? "");
  const [remind, setRemind] = useState("");

  return (
    <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          Send SMS to {leadName}
        </p>
        <span className="inline-flex items-center gap-1 text-[10px] text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-2 py-0.5">
          <Info size={11} /> Phase 2 — Twilio integration
        </span>
      </div>
      <textarea
        rows={2}
        placeholder={`Hi ${leadName}, following up on our chat earlier…`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E2761]/20 focus:border-[#1E2761]"
      />
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <label className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
          <span className="font-medium">From:</span>
          <select
            value={sendFrom}
            onChange={(e) => setSendFrom(e.target.value)}
            className="bg-transparent text-gray-900 font-medium outline-none"
          >
            {salespeople.map((sp) => (
              <option key={sp} value={sp}>
                {sp}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
          <span className="font-medium">Remind:</span>
          <select
            value={remind}
            onChange={(e) => setRemind(e.target.value)}
            className="bg-transparent text-gray-900 font-medium outline-none"
          >
            {REMIND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="text-[11px] text-gray-500 hover:text-gray-900 underline underline-offset-2"
        >
          Add note
        </button>
        <div className="flex-1" />
        <button
          disabled
          title="Phase 2: integrated SMS via Twilio"
          className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1E2761] opacity-50 cursor-not-allowed"
        >
          Send SMS
        </button>
      </div>
    </div>
  );
}
