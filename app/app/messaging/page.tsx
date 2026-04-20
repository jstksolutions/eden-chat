import type { Metadata } from "next";
import { Send } from "lucide-react";
import { Phase2Stub } from "../_components/Phase2Stub";

export const metadata: Metadata = { title: "Messaging" };

export default function Page() {
  return (
    <Phase2Stub
      icon={Send}
      title="Messaging"
      description="Outbound SMS, drip sequences, re-engagement. Triggered flows that pick back up exactly where the conversation left off — via SMS, email, or chat."
    />
  );
}
