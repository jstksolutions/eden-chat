"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Sparkles,
  MessageSquare,
  FileText,
  Layout,
  Bot,
  MessageCircleMore,
  Phone,
  Send,
  Building2,
  Briefcase,
  Settings,
  LogOut,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { NAV_GROUPS } from "@/lib/app-nav";
import type { SessionContext } from "@/lib/auth/server";

const ICONS: Record<string, LucideIcon> = {
  Stats: BarChart3,
  "AI Insights": Sparkles,
  "Web Assistant": MessageSquare,
  "Static Webforms": FileText,
  "Landing Pages": Layout,
  "AI Agents": Bot,
  "All Conversations": MessageCircleMore,
  "Phone Calls": Phone,
  Messaging: Send,
  "All Communities": Building2,
  "Job Applicants": Briefcase,
  Settings: Settings,
};

export function AppSidebar({ session }: { session: SessionContext }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo header */}
      <div className="px-5 h-14 flex items-center gap-2.5 border-b border-gray-100">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#1E2761" }}
        >
          <span className="text-white text-xs font-bold">E</span>
        </div>
        <div className="leading-tight">
          <p className="text-[13px] font-semibold text-gray-900">Eden Chat</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
            Admissions
          </p>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1.5">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = ICONS[item.label] ?? AlertCircle;
                const active =
                  pathname === item.href ||
                  (item.href !== "/app" &&
                    pathname.startsWith(item.href + "/"));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] transition-colors ${
                        active
                          ? "bg-[#eef0fa] text-[#1E2761] font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon
                        size={15}
                        className={active ? "text-[#1E2761]" : "text-gray-400"}
                        strokeWidth={2}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {!item.live && item.phase && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                          {item.phase}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
            style={{ backgroundColor: "#1E2761" }}
          >
            {initials(session.displayName)}
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <p className="text-[12px] font-semibold text-gray-900 truncate">
              {session.displayName}
            </p>
            <p className="text-[10px] text-gray-500 truncate">
              {session.organizationName}
            </p>
          </div>
        </div>
        <form action="/auth/signout" method="post" className="mt-1.5">
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
