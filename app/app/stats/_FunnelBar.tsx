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
        style={{ backgroundColor: "#eef0fa" }}
      >
        <div
          className="h-1.5 rounded-full"
          style={{
            backgroundColor: "#1E2761",
            width:
              pctOfPrev != null
                ? `${Math.min(100, pctOfPrev)}%`
                : "100%",
          }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-gray-500">
        {isFirst
          ? "All-visitor baseline"
          : pctOfPrev != null
          ? `${pctOfPrev}% of previous step`
          : "—"}
      </p>
    </div>
  );
}
