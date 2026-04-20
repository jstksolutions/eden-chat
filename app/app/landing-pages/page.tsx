import type { Metadata } from "next";
import { Layout } from "lucide-react";
import { Phase2Stub } from "../_components/Phase2Stub";

export const metadata: Metadata = { title: "Landing Pages" };

export default function Page() {
  return (
    <Phase2Stub
      icon={Layout}
      title="Landing Pages"
      description="Facility-specific landing pages with integrated chat. Drop a URL into an ad campaign and the visitor lands on a page that knows which community they're interested in."
    />
  );
}
