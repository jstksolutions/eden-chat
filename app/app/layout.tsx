import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/server";
import { AppSidebar } from "./_components/AppSidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      <AppSidebar session={session} />
      <main className="flex-1 min-w-0 flex flex-col">{children}</main>
    </div>
  );
}
