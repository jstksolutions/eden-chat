"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { ChatWidget } from "@/components/ChatWidget";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export interface FeaturedFacility {
  id: string;
  name: string;
  state: string;
  phone: string;
  city: string;
  type: "snf" | "al" | "memory_care" | "rehab";
}

export function HomeClient({
  featured,
  others,
}: {
  featured: FeaturedFacility[];
  others: { id: string; name: string; state: string; type: string }[];
}) {
  const [selected, setSelected] = useState<FeaturedFacility | null>(
    featured[0] ?? null
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef0fa] via-white to-white">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#1E2761" }}
            >
              <span className="text-white text-xs font-bold">E</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">Eden Chat</p>
          </div>
          <Link
            href="/login"
            className="text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            Staff sign in →
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 lg:py-14">
        <section className="max-w-3xl">
          <p
            className="inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{
              color: "#1E2761",
              backgroundColor: "#eef0fa",
            }}
          >
            Eden Senior Care — AI Lead Assistant
          </p>
          <h1 className="mt-4 text-4xl lg:text-5xl font-serif-display leading-tight text-gray-900">
            Meet families where they are — on the website, day one.
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            A lead assistant that speaks Eden. Every conversation is grounded in
            the specific community the visitor is researching — their services,
            insurance, rehab programs, even the nearest hospital referral
            patterns.
          </p>
        </section>

        <section className="mt-10 lg:mt-14 grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-8 lg:gap-12 items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Try it for a community
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {featured.map((f) => {
                const active = selected?.id === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelected(f)}
                    className={`text-left rounded-xl border px-4 py-3 transition-all ${
                      active
                        ? "border-[#1E2761] bg-white shadow-sm"
                        : "border-gray-200 bg-white/60 hover:border-gray-300"
                    }`}
                  >
                    <p
                      className={`text-[13px] font-semibold ${
                        active ? "text-[#1E2761]" : "text-gray-900"
                      }`}
                    >
                      {f.name}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin size={11} /> {f.city}, {f.state}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                What to try
              </p>
              <ul className="text-sm text-gray-700 space-y-1.5">
                <li>
                  &ldquo;My mother has mid-stage dementia. Can you tell me about
                  your memory care?&rdquo;
                </li>
                <li>&ldquo;I&rsquo;d like to schedule a tour this weekend.&rdquo;</li>
                <li>&ldquo;Do you accept long-term care insurance?&rdquo;</li>
                <li>&ldquo;How is your community different from the one down the street?&rdquo;</li>
              </ul>
            </div>

            {others.length > 0 && (
              <details className="mt-6 bg-white/70 rounded-xl border border-gray-200 px-5 py-4">
                <summary className="cursor-pointer text-[13px] font-medium text-gray-700 hover:text-gray-900">
                  Other Eden facilities ({others.length}) →
                </summary>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1 text-[12px]">
                  {others.map((f) => (
                    <Link
                      key={f.id}
                      href={`/embed/${f.id}`}
                      className="flex items-center gap-1 text-gray-600 hover:text-[#1E2761]"
                    >
                      <ArrowRight size={10} />
                      {f.name} <span className="text-gray-400">· {f.state}</span>
                    </Link>
                  ))}
                </div>
              </details>
            )}
          </div>

          {/* Chat widget rendered inline, facility-keyed */}
          <div className="h-[640px] rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-200">
            {selected && (
              <ChatWidget
                key={selected.id}
                facilityId={selected.id}
                facilityName={selected.name}
                facilityPhone={selected.phone}
                facilityType={selected.type}
                isEmbedded
                resettable={DEMO_MODE}
              />
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 mt-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center">
          <p className="text-[11px] text-gray-400">
            Eden Chat · Built by JS Technology Solutions ·{" "}
            <Link
              href="/login"
              className="hover:text-gray-600 transition-colors"
            >
              Dashboard
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
