import { notFound } from "next/navigation";
import { getFacilityById } from "@/lib/facilities/data";
import { ChatWidget } from "@/components/ChatWidget";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const facility = getFacilityById(slug);
  if (!facility) notFound();

  return (
    <div className="h-screen w-screen overflow-hidden bg-transparent">
      <ChatWidget
        facilityId={facility.id}
        facilityName={facility.name}
        facilityPhone={facility.phone}
        facilityType={facility.type}
        isEmbedded
        resettable={DEMO_MODE}
      />
    </div>
  );
}
