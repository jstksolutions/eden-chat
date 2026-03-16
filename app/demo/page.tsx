"use client";

import { useState, useMemo } from "react";
import { getAllFacilities } from "@/lib/facilities/data";
import type { Facility } from "@/lib/facilities/data";
import { ChatWidget } from "@/components/ChatWidget";
import { Phone, MapPin, ChevronDown } from "lucide-react";

const EDEN_GREEN = "#2E5A3A";
const EDEN_GREEN_LIGHT = "#4A8A5F";

const ALL_FACILITIES = getAllFacilities();

function getServiceCards(facility: Facility) {
  if (facility.type === "snf") {
    return [
      {
        title: "Skilled Nursing",
        desc: "24/7 licensed nursing care with physician oversight and complex medical management.",
        icon: "🏥",
      },
      {
        title: "Rehabilitation",
        desc: "Physical, occupational, and speech therapy to restore your strength and independence.",
        icon: "💪",
      },
      {
        title: "Long-Term Care",
        desc: "Compassionate, personalized support for residents who call our facility home.",
        icon: "🏠",
      },
    ];
  }
  if (facility.type === "memory_care") {
    return [
      {
        title: "Memory Care",
        desc: "Specialized programming and secured environments designed for those living with dementia.",
        icon: "🧠",
      },
      {
        title: "Daily Support",
        desc: "Personalized assistance with daily living activities in a warm, homelike setting.",
        icon: "🤝",
      },
      {
        title: "Family Partnership",
        desc: "Education, support groups, and open communication to keep families involved and informed.",
        icon: "👨‍👩‍👧",
      },
    ];
  }
  // AL
  return [
    {
      title: "Assisted Living",
      desc: "Personalized support with daily activities while preserving your independence and dignity.",
      icon: "🌟",
    },
    {
      title: "Wellness Programs",
      desc: "Fitness classes, social events, and enrichment activities for a vibrant lifestyle.",
      icon: "🧘",
    },
    {
      title: "Dining & Community",
      desc: "Chef-prepared meals, restaurant-style dining, and a warm community to call home.",
      icon: "🍽️",
    },
  ];
}

function MockWebsite({ facility }: { facility: Facility }) {
  const cards = getServiceCards(facility);
  const facilityTypeLabel =
    facility.type === "snf"
      ? "Skilled Nursing & Rehabilitation"
      : facility.type === "memory_care"
      ? "Memory Care Community"
      : "Assisted Living Community";

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white rounded-xl shadow-inner border border-gray-200">
      {/* Fake browser chrome */}
      <div className="shrink-0 bg-gray-100 border-b border-gray-300 px-3 py-2 flex items-center gap-2 rounded-t-xl">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded border border-gray-300 px-3 py-1 text-xs text-gray-500 truncate">
          {facility.hostname}
        </div>
      </div>

      {/* Facility nav bar */}
      <div
        className="shrink-0 flex items-center justify-between px-6 py-3"
        style={{ backgroundColor: EDEN_GREEN }}
      >
        <span className="text-white font-bold text-sm tracking-wide">Eden Senior Care</span>
        <nav className="hidden sm:flex gap-5 text-white/80 text-xs font-medium">
          {["About", "Services", "Amenities", "Contact"].map((link) => (
            <span key={link} className="hover:text-white cursor-default transition-colors">
              {link}
            </span>
          ))}
        </nav>
      </div>

      {/* Hero */}
      <div
        className="shrink-0 relative px-6 py-10 flex flex-col items-start justify-end gap-3"
        style={{
          background: `linear-gradient(135deg, ${EDEN_GREEN} 0%, ${EDEN_GREEN_LIGHT} 60%, #7AB89A 100%)`,
          minHeight: "180px",
        }}
      >
        <div className="absolute inset-0 bg-black/20 rounded-none" />
        <div className="relative z-10">
          <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-1">
            {facilityTypeLabel}
          </p>
          <h1 className="text-white text-2xl font-bold leading-tight">{facility.name}</h1>
          <p className="text-white/90 text-sm mt-1 mb-3">
            Compassionate Care. Exceptional Results.
          </p>
          <button
            className="bg-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-default"
            style={{ color: EDEN_GREEN }}
          >
            Schedule a Visit
          </button>
        </div>
      </div>

      {/* Service cards */}
      <div className="px-5 py-5">
        <h2
          className="text-base font-bold mb-3"
          style={{ color: EDEN_GREEN }}
        >
          Our Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-default"
            >
              <div className="text-2xl mb-2">{card.icon}</div>
              <h3 className="font-semibold text-sm text-gray-800 mb-1">{card.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Insurance strip */}
      <div className="mx-5 mb-5 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
        <p className="text-xs font-semibold text-gray-700 mb-1">Insurance Accepted</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          {facility.insuranceAccepted.slice(0, 4).join(" • ")}
          {facility.insuranceAccepted.length > 4 && " • and more"}
        </p>
      </div>

      {/* Footer */}
      <div
        className="shrink-0 mt-auto px-5 py-4 border-t border-gray-200"
        style={{ backgroundColor: "#F9FAFB" }}
      >
        <div className="flex flex-col gap-1.5 text-xs text-gray-500">
          <div className="flex items-start gap-1.5">
            <MapPin size={12} className="mt-0.5 shrink-0" style={{ color: EDEN_GREEN }} />
            <span>{facility.address}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone size={12} className="shrink-0" style={{ color: EDEN_GREEN }} />
            <span>{facility.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [selectedId, setSelectedId] = useState<string>(ALL_FACILITIES[0].id);

  const selectedFacility = useMemo(
    () => ALL_FACILITIES.find((f) => f.id === selectedId) ?? ALL_FACILITIES[0],
    [selectedId]
  );

  // Group facilities for the dropdown
  const mnFacilities = ALL_FACILITIES.filter((f) => f.state === "MN");
  const wiFacilities = ALL_FACILITIES.filter(
    (f) => f.state === "WI" && f.division === "edenbrook"
  );
  const vistaFacilities = ALL_FACILITIES.filter((f) => f.division === "vista");

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top bar */}
      <header className="shrink-0 bg-white shadow-sm border-b border-gray-200 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: EDEN_GREEN }}
            >
              <span className="text-white text-xs font-bold">E</span>
            </div>
            <div>
              <span className="font-bold text-gray-800 text-sm">Eden Care Assistant</span>
              <span className="text-gray-400 text-sm"> — Live Demo</span>
            </div>
          </div>

          {/* Facility selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 hidden sm:block whitespace-nowrap">
              Select facility:
            </label>
            <div className="relative">
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 cursor-pointer max-w-[260px] truncate"
                style={{ focusRingColor: EDEN_GREEN } as React.CSSProperties}
              >
                <optgroup label="Edenbrook — Minnesota">
                  {mnFacilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Edenbrook — Wisconsin">
                  {wiFacilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Vista Senior Living">
                  {vistaFacilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto h-full px-4 py-4">
          {/* Desktop: two-column grid. Mobile: stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
            {/* Mock website — 3 cols */}
            <div className="lg:col-span-3 overflow-hidden max-lg:h-[340px]">
              <MockWebsite facility={selectedFacility} />
            </div>

            {/* Chat widget — 2 cols */}
            <div className="lg:col-span-2 overflow-hidden">
              <ChatWidget
                key={selectedFacility.id}
                facilityId={selectedFacility.id}
                facilityName={selectedFacility.name}
                primaryColor={EDEN_GREEN}
                isEmbedded
              />
            </div>
          </div>
        </div>
      </main>

      {/* Info bar */}
      <footer className="shrink-0 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <p className="text-center text-xs text-gray-500 py-2.5 px-4">
          This is a live AI demo. The assistant has real-time knowledge of each Eden facility&apos;s
          services, insurance, and amenities. Try switching facilities to see facility-specific
          responses.
        </p>
      </footer>
    </div>
  );
}
