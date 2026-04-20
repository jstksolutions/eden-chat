import Link from "next/link";
import { SCORE_META } from "@/lib/ui/brand";

export function QuickJumpRail({
  currentId,
  leads,
}: {
  currentId: string;
  leads: { id: string; name: string; score: string; facility: string }[];
}) {
  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
          Recent Leads
        </p>
      </div>
      <ul className="py-1">
        {leads.map((l) => {
          const meta = SCORE_META[l.score] ?? SCORE_META.warm;
          const active = l.id === currentId;
          return (
            <li key={l.id}>
              <Link
                href={`/app/conversations/${l.id}`}
                className={`block px-4 py-2.5 border-l-2 transition-colors ${
                  active
                    ? "bg-[#eef0fa] border-[#1E2761]"
                    : "border-transparent hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <p
                    className={`text-[12px] truncate ${
                      active ? "font-semibold text-[#1E2761]" : "text-gray-800"
                    }`}
                  >
                    {l.name}
                  </p>
                </div>
                <p className="text-[10px] text-gray-500 truncate pl-3">
                  {l.facility}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
