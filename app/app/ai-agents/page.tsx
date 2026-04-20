import type { Metadata } from "next";
import { Bot } from "lucide-react";
import { Phase2Stub } from "../_components/Phase2Stub";

export const metadata: Metadata = { title: "AI Agents" };

export default function Page() {
  return (
    <Phase2Stub
      icon={Bot}
      title="AI Agents"
      description="Multi-modal AI agents including voice. Outbound follow-up calls, inbound call handling, and SMS back-and-forth that feels like a trained counselor."
    />
  );
}
