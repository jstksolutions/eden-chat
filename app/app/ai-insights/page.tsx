import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { Phase2Stub } from "../_components/Phase2Stub";

export const metadata: Metadata = { title: "AI Insights" };

export default function Page() {
  return (
    <Phase2Stub
      icon={Sparkles}
      title="AI Insights"
      description="Narrative analytics over your conversation corpus. Eden-wide themes, objection patterns, and sales-team coaching recommendations surfaced weekly."
    />
  );
}
