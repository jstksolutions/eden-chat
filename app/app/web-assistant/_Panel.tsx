"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

export function WebAssistantPanel({
  appUrl,
  facilities,
}: {
  appUrl: string;
  facilities: { id: string; slug: string; name: string }[];
}) {
  const [facility, setFacility] = useState(facilities[0]?.slug ?? "");
  const [copied, setCopied] = useState(false);

  const widgetUrl = `${appUrl}/widget/eden-chat.js`;
  const snippet = `<script src="${widgetUrl}" data-facility-id="${facility}" async></script>`;

  async function copy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900">Embed snippet</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Paste inside the closing <code className="font-mono">&lt;/body&gt;</code>{" "}
          tag on your facility website.
        </p>

        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <label className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
            <span className="font-medium">Community:</span>
            <select
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className="bg-transparent text-gray-900 font-medium outline-none"
            >
              {facilities.map((f) => (
                <option key={f.slug} value={f.slug}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => void copy()}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border ${
              copied
                ? "bg-teal-50 border-teal-200 text-teal-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy snippet"}
          </button>
          <a
            href={`/embed/${facility}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink size={13} />
            Preview widget
          </a>
        </div>

        <pre className="mt-4 bg-gray-900 rounded-lg p-4 text-[12px] font-mono text-green-300 overflow-x-auto">
          {snippet}
        </pre>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900">How it works</h2>
        <ol className="mt-3 space-y-2 text-xs text-gray-600 list-decimal list-inside">
          <li>
            Paste the snippet above into any Eden facility&apos;s WordPress theme
            footer.
          </li>
          <li>
            The widget loads lazily and auto-detects the hostname. For single
            pages that need a specific facility context, pass it via{" "}
            <code className="font-mono">data-facility-id</code>.
          </li>
          <li>
            Conversations, tour requests, and qualified leads flow back to this
            dashboard in real time.
          </li>
        </ol>
      </section>
    </div>
  );
}
