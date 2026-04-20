// Palette: Eden navy for visitor/engagement baseline, teal (deck "positive
// progression") for leads → tours → move-ins, coral for drop-off deltas.
const POSITIVE_STEPS = new Set(["Leads", "Tours Scheduled", "Move-ins"]);

export function FunnelBar({
  label,
  value,
  pctOfPrev,
  isFirst,
}: {
  label: string;
  value: number;
  pctOfPrev: number | null;
  isFirst: boolean;
}) {
  const isPositive = POSITIVE_STEPS.has(label);
  const isDropoff = pctOfPrev != null && pctOfPrev < 50;
  const barColor = isPositive ? "#2BB3A3" : "#1E2761";
  const trackColor = isPositive ? "#e6f7f4" : "#eef0fa";

  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
        {label}
      </p>
      <p className="mt-1 text-3xl font-serif-display text-gray-900">
        {value.toLocaleString()}
      </p>
      <div
        className="mt-3 h-1.5 rounded-full"
        style={{ backgroundColor: trackColor }}
      >
        <div
          className="h-1.5 rounded-full"
          style={{
            backgroundColor: barColor,
            width:
              pctOfPrev != null
                ? `${Math.min(100, pctOfPrev)}%`
                : "100%",
          }}
        />
      </div>
      <p
        className="mt-1.5 text-[11px]"
        style={{
          color: isDropoff ? "#F96167" : "#6b7280",
        }}
      >
        {isFirst
          ? "All-visitor baseline"
          : pctOfPrev != null
          ? `${pctOfPrev}% of previous step`
          : "—"}
      </p>
    </div>
  );
}
