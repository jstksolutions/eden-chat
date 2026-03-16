"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, BookmarkIcon, BarChart2 } from "lucide-react";

const EDEN_GREEN = "#2E5A3A";
const PROD_URL = "https://eden-chat.vercel.app";
const WIDGET_URL = `${PROD_URL}/widget/eden-chat.js`;

// Console snippet shown to the user — pretty-printed for readability
const CONSOLE_SNIPPET = `(function () {
  var s = document.createElement("script");
  s.src = "${WIDGET_URL}";
  document.body.appendChild(s);
})();`;

// Bookmarklet — minified, # encoded as %23 for href safety
const BOOKMARKLET_HREF = `javascript:(function(){var s=document.createElement('script');s.src='${WIDGET_URL}';document.body.appendChild(s);})();`;

// Facilities with live public websites to open as test targets
const QUICK_TEST_SITES = [
  {
    label: "Edenbrook Edina",
    url: "https://www.edenbrookedina.com",
    type: "SNF — Minnesota",
  },
  {
    label: "Edenbrook Green Bay",
    url: "https://www.edenbrookgreenbay.com",
    type: "SNF — Wisconsin",
  },
  {
    label: "Edenbrook Wisconsin Rapids",
    url: "https://www.edenbrookwisconsinrapids.com",
    type: "SNF — Wisconsin",
  },
  {
    label: "The Heights at Evansville",
    url: "https://www.theheightsatevansville.com",
    type: "AL — Wisconsin",
  },
];

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={() => void handleCopy()}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all"
      style={
        copied
          ? { backgroundColor: "#f0fdf4", borderColor: "#86efac", color: "#15803d" }
          : { backgroundColor: "white", borderColor: "#d1d5db", color: "#374151" }
      }
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied!" : label}
    </button>
  );
}

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: EDEN_GREEN }}
            >
              <span className="text-white text-xs font-bold">E</span>
            </div>
            <span className="font-bold text-gray-800 text-sm">
              Eden Care Assistant{" "}
              <span className="text-gray-400 font-normal">— Setup</span>
            </span>
          </div>
          <a
            href="/admin"
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            <BarChart2 size={14} />
            Leads Dashboard →
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-12">
        {/* Hero */}
        <section>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Eden Care Assistant
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
            An AI chat widget for Eden&apos;s facility network. Drop it on any Eden website
            in under 30 seconds — no code deployment, no IT ticket. It auto-detects
            the facility from the page&apos;s hostname and loads facility-specific context.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Live AI (Claude claude-sonnet-4-5)
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              31 facilities pre-loaded
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Lead capture + email alerts
            </div>
          </div>
        </section>

        {/* ── Section 1: Console inject ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              1 — Inject via browser console
            </h2>
            <CopyButton text={CONSOLE_SNIPPET} label="Copy snippet" />
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Open any Eden facility website, press{" "}
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
              F12
            </kbd>{" "}
            → Console, paste this, and hit Enter. The chat widget appears instantly.
          </p>
          <div className="relative bg-gray-900 rounded-xl overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-gray-400 font-mono">Console</span>
            </div>
            <pre className="px-5 py-4 text-sm font-mono text-green-400 overflow-x-auto leading-relaxed whitespace-pre">
              {CONSOLE_SNIPPET}
            </pre>
          </div>
        </section>

        {/* ── Section 2: Bookmarklet ── */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            2 — Bookmarklet (click-to-inject)
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Drag the button below to your bookmarks bar. Then on any Eden website,
            just click the bookmark — no console needed.
          </p>
          <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 border-dashed rounded-xl">
            <a
              href={BOOKMARKLET_HREF}
              onClick={(e) => e.preventDefault()}
              draggable
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm select-none cursor-grab active:cursor-grabbing"
              style={{ backgroundColor: EDEN_GREEN }}
              title="Drag me to your bookmarks bar"
            >
              <BookmarkIcon size={15} />
              Eden Chat Widget
            </a>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Drag → Bookmarks bar
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Or right-click → Bookmark this link
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 3: Quick Test links ── */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            3 — Quick test on real Eden sites
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Open a facility website, then use the console snippet or bookmarklet above
            to inject the widget. The assistant will automatically load that
            facility&apos;s data.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_TEST_SITES.map((site) => (
              <a
                key={site.url}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all group"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">
                    {site.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{site.type}</p>
                  <p className="text-xs text-gray-400 mt-1 font-mono">
                    {site.url.replace("https://www.", "")}
                  </p>
                </div>
                <ExternalLink
                  size={14}
                  className="text-gray-400 group-hover:text-gray-600 shrink-0 mt-0.5 transition-colors"
                />
              </a>
            ))}
          </div>
        </section>

        {/* ── Section 4: WordPress embed code ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              4 — Permanent embed (WordPress)
            </h2>
            <CopyButton
              text={`<script src="${WIDGET_URL}" async></script>`}
              label="Copy tag"
            />
          </div>
          <p className="text-sm text-gray-500 mb-4">
            For a permanent installation, paste this before the{" "}
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
              &lt;/body&gt;
            </code>{" "}
            tag in the WordPress theme editor or via the WPCode plugin. The widget
            auto-detects the facility from the page&apos;s hostname.
          </p>
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-gray-400 font-mono">HTML</span>
            </div>
            <pre className="px-5 py-4 text-sm font-mono text-blue-300 overflow-x-auto">
              {`<script src="${WIDGET_URL}" async></script>`}
            </pre>
          </div>
        </section>

        {/* ── Leads dashboard CTA ── */}
        <section>
          <div
            className="rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4"
            style={{ backgroundColor: EDEN_GREEN }}
          >
            <div className="flex-1">
              <p className="font-semibold text-white text-base">
                View captured leads
              </p>
              <p className="text-white/70 text-sm mt-1">
                Every conversation that captures a name + phone number sends an
                email alert and appears in the Leads Dashboard.
              </p>
            </div>
            <a
              href="/admin"
              className="shrink-0 inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ color: EDEN_GREEN }}
            >
              <BarChart2 size={15} />
              Leads Dashboard
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 mt-16">
        <p className="text-center text-xs text-gray-400 py-6">
          Eden Care Assistant · Built by JS Technology Solutions ·{" "}
          <a href="/admin" className="hover:text-gray-600 transition-colors">
            Admin
          </a>
        </p>
      </footer>
    </div>
  );
}
