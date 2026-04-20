interface Point {
  date: string;
  leads: number;
  tours: number;
  moveIns: number;
}

const WIDTH = 960;
const HEIGHT = 220;
const PAD = { top: 14, right: 16, bottom: 28, left: 36 };

export function LineChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">
        No data for this range.
      </div>
    );
  }

  const maxVal = Math.max(
    1,
    ...data.flatMap((d) => [d.leads, d.tours, d.moveIns])
  );
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const step = data.length > 1 ? innerW / (data.length - 1) : innerW;

  function y(v: number) {
    return PAD.top + innerH - (v / maxVal) * innerH;
  }
  function x(i: number) {
    return PAD.left + i * step;
  }

  const buildPath = (key: keyof Omit<Point, "date">) =>
    data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d[key])}`)
      .join(" ");

  const yTicks = [0, Math.ceil(maxVal / 2), maxVal];
  const xTicks = pickXTicks(data.length);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full h-[220px]"
      preserveAspectRatio="none"
    >
      {/* Grid */}
      {yTicks.map((t) => (
        <g key={`y-${t}`}>
          <line
            x1={PAD.left}
            x2={WIDTH - PAD.right}
            y1={y(t)}
            y2={y(t)}
            stroke="#f1f5f9"
            strokeWidth={1}
          />
          <text
            x={PAD.left - 6}
            y={y(t) + 3}
            fontSize="10"
            fill="#94a3b8"
            textAnchor="end"
          >
            {t}
          </text>
        </g>
      ))}

      {/* X labels */}
      {xTicks.map((i) => (
        <text
          key={`x-${i}`}
          x={x(i)}
          y={HEIGHT - 10}
          fontSize="10"
          fill="#94a3b8"
          textAnchor="middle"
        >
          {formatDateShort(data[i].date)}
        </text>
      ))}

      {/* Lines */}
      <path
        d={buildPath("leads")}
        fill="none"
        stroke="#1E2761"
        strokeWidth={2}
      />
      <path
        d={buildPath("tours")}
        fill="none"
        stroke="#0fb5a6"
        strokeWidth={2}
      />
      <path
        d={buildPath("moveIns")}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={2}
      />

      {/* End-point dots */}
      {data.length > 0 && (
        <>
          <circle
            cx={x(data.length - 1)}
            cy={y(data[data.length - 1].leads)}
            r={3}
            fill="#1E2761"
          />
          <circle
            cx={x(data.length - 1)}
            cy={y(data[data.length - 1].tours)}
            r={3}
            fill="#0fb5a6"
          />
          <circle
            cx={x(data.length - 1)}
            cy={y(data[data.length - 1].moveIns)}
            r={3}
            fill="#f59e0b"
          />
        </>
      )}
    </svg>
  );
}

function pickXTicks(n: number): number[] {
  if (n <= 1) return [0];
  if (n <= 7) return Array.from({ length: n }, (_, i) => i);
  const count = 6;
  return Array.from({ length: count }, (_, i) =>
    Math.round((i * (n - 1)) / (count - 1))
  );
}

function formatDateShort(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
