import Link from "next/link";
import { PageHeader } from "../_components/PageHeader";
import { SETTINGS_ITEMS } from "@/lib/app-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Profile, team, and portfolio configuration."
      />
      <div className="px-8 py-6 flex gap-6">
        <aside className="w-56 shrink-0">
          <nav className="space-y-0.5">
            {SETTINGS_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-[13px] text-gray-600 hover:bg-white hover:text-gray-900 transition-colors"
              >
                <span>{item.label}</span>
                {!item.live && item.phase && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                    {item.phase}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </aside>
        <section className="flex-1 min-w-0">{children}</section>
      </div>
    </>
  );
}
