import { getAllFacilities } from "@/lib/facilities/data";
import { HomeClient } from "./_HomeClient";

export default function Home() {
  // Prioritize the 6 demo communities for the picker. Everything else is still
  // embeddable via /embed/[slug] but doesn't pollute the hero.
  const DEMO_SLUGS = [
    "mission-creek",
    "eden-heritage-arlington",
    "eden-vista-barrington",
    "eden-vista-skokie",
    "eden-vista-wheaton",
    "eden-gardens-columbus",
  ];

  const all = getAllFacilities();
  const demoSet = new Set(DEMO_SLUGS);
  const featured = DEMO_SLUGS.map((slug) => all.find((f) => f.id === slug)).filter(
    (f): f is NonNullable<typeof f> => !!f
  );

  const otherFacilities = all
    .filter((f) => !demoSet.has(f.id))
    .map((f) => ({ id: f.id, name: f.name, state: f.state, type: f.type }));

  return (
    <HomeClient
      featured={featured.map((f) => ({
        id: f.id,
        name: f.name,
        state: f.state,
        phone: f.phone,
        city: f.city,
        type: f.type,
      }))}
      others={otherFacilities}
    />
  );
}
