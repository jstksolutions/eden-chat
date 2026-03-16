import { facilities } from "@/data/facilities";
import type { Facility } from "@/data/facilities";

export type { Facility };

export function getFacilityByHostname(hostname: string): Facility | null {
  const normalized = hostname.toLowerCase().replace(/^www\./, "");

  return (
    facilities.find((f) => {
      const fHost = f.hostname.toLowerCase().replace(/^www\./, "");
      return fHost === normalized;
    }) ?? null
  );
}

export function getFacilityById(id: string): Facility | null {
  return facilities.find((f) => f.id === id) ?? null;
}

export function getAllFacilities(): Facility[] {
  return facilities;
}
