import { getFacilityById } from "@/lib/facilities/data";
import { ChatWidget } from "@/components/ChatWidget";

interface WidgetPageProps {
  searchParams: Promise<{ facilityId?: string }>;
}

export default async function WidgetPage({ searchParams }: WidgetPageProps) {
  const { facilityId } = await searchParams;
  const facility = facilityId ? getFacilityById(facilityId) : null;

  if (!facility) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500 text-sm">
        Facility not found. Check the facilityId parameter.
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <ChatWidget
        facilityId={facility.id}
        facilityName={facility.name}
        primaryColor="#2E5A3A"
        isEmbedded
      />
    </div>
  );
}
