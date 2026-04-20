import { Layout } from "lucide-react";
import { Phase2Stub } from "../_components/Phase2Stub";

export default function Page() {
  return (
    <Phase2Stub
      icon={Layout}
      title="Landing Pages"
      description="Facility-specific landing pages with integrated chat. Drop a URL into an ad campaign and the visitor lands on a page that knows which community they're interested in."
    />
  );
}
