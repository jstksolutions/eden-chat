import { notFound } from "next/navigation";
import { Settings as SettingsIcon } from "lucide-react";
import { Phase2Stub } from "../../_components/Phase2Stub";
import { SETTINGS_ITEMS } from "@/lib/app-nav";

export default async function SettingsStub({
  params,
}: {
  params: Promise<{ rest: string[] }>;
}) {
  const { rest } = await params;
  const href = `/app/settings/${rest.join("/")}`;
  const item = SETTINGS_ITEMS.find((i) => i.href === href);

  if (!item) notFound();
  // Live settings sub-routes are handled by their own page files (users,
  // tour-hours). Only Phase 2 stubs fall through here.
  if (item.live) notFound();

  return (
    <Phase2Stub
      icon={SettingsIcon}
      title={item.label}
      description={
        item.description ??
        "Configuration area available in the next phase of delivery."
      }
      phase={item.phase ?? "Phase 2"}
    />
  );
}
