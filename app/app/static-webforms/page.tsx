import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { Phase2Stub } from "../_components/Phase2Stub";

export const metadata: Metadata = { title: "Static Webforms" };

export default function Page() {
  return (
    <Phase2Stub
      icon={FileText}
      title="Static Webforms"
      description="Replace legacy web forms with chatbot-equivalent capture. Every existing Eden contact form routes here and auto-upgrades to a conversational experience."
    />
  );
}
