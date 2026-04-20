import type { LucideIcon } from "lucide-react";

export function Phase2Stub({
  icon: Icon,
  title,
  description,
  phase = "Phase 2",
  sowRef = "SOW section 3.2",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  phase?: "Phase 2" | "Phase 3";
  sowRef?: string;
}) {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full text-center">
        <div
          className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: "#eef0fa" }}
        >
          <Icon size={34} strokeWidth={1.75} style={{ color: "#1E2761" }} />
        </div>

        <h1 className="text-2xl font-serif-display text-gray-900 mb-3">
          {title}
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {description}
        </p>

        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border"
          style={{
            backgroundColor: "#f0fdfa",
            borderColor: "#99f6e4",
            color: "#0f766e",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
          Ships in {phase} — see {sowRef}
        </div>
      </div>
    </div>
  );
}
