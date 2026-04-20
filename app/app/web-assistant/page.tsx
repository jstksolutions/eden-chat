import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/server";
import { listFacilities } from "@/lib/app-data";
import { PageHeader } from "../_components/PageHeader";
import { WebAssistantPanel } from "./_Panel";

export default async function WebAssistantPage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const facilities = await listFacilities(session.organizationId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://eden.jstech-inc.com";

  return (
    <>
      <PageHeader
        title="Web Assistant"
        subtitle="One embed snippet. Drops onto any facility website in under 30 seconds."
      />
      <div className="px-8 py-6 max-w-4xl">
        <WebAssistantPanel
          appUrl={appUrl}
          facilities={facilities.map((f) => ({
            id: f.id,
            slug: f.slug,
            name: f.name,
          }))}
        />
      </div>
    </>
  );
}
