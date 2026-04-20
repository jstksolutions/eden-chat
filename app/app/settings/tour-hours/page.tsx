import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/server";
import { listFacilities } from "@/lib/app-data";
import { TourHoursForm } from "./_Form";

export default async function TourHoursPage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const facilities = await listFacilities(session.organizationId);

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          Tour Availability
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          When should the chatbot offer tours? Set business hours per community.
        </p>
      </div>
      <TourHoursForm
        facilities={facilities.map((f) => ({
          id: f.id,
          name: f.name,
          business_hours:
            (f.business_hours as Record<string, { open: string; close: string }> | null) ??
            null,
        }))}
      />
    </div>
  );
}
