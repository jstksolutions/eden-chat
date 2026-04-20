import { MapPin } from "lucide-react";

// Static placeholder map: shows a labeled pin + approximate locale. We
// intentionally avoid hitting an external tile server (no API key, no
// third-party requests firing during the demo).
export function LocationMap({
  city,
  state,
}: {
  city: string | null;
  state: string | null;
}) {
  const label = [city, state].filter(Boolean).join(", ") || "Location unknown";

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200 h-40 bg-gradient-to-br from-[#eef0fa] via-white to-[#f0fdfa]">
      <svg
        viewBox="0 0 320 160"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            x2="320"
            y1={i * 18}
            y2={i * 18}
            stroke="#c7d2e3"
            strokeOpacity="0.28"
          />
        ))}
        {Array.from({ length: 18 }).map((_, i) => (
          <line
            key={`v-${i}`}
            y1="0"
            y2="160"
            x1={i * 20}
            x2={i * 20}
            stroke="#c7d2e3"
            strokeOpacity="0.28"
          />
        ))}
        <path
          d="M20 120 Q 80 80, 150 100 T 300 70"
          fill="none"
          stroke="#0fb5a6"
          strokeOpacity="0.6"
          strokeWidth="2"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col gap-1">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: "#1E2761" }}
        >
          <MapPin size={16} className="text-white" />
        </div>
        <p className="text-[11px] font-semibold text-gray-800 bg-white/90 px-2 py-0.5 rounded">
          {label}
        </p>
      </div>
    </div>
  );
}
