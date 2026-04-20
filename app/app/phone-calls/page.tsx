import { Phone } from "lucide-react";
import { Phase2Stub } from "../_components/Phase2Stub";

export default function Page() {
  return (
    <Phase2Stub
      icon={Phone}
      title="Phone Calls"
      description="Phone tracking delivers in Phase 2, weeks 3–4. Every inbound call per DID is recorded, transcribed, summarized, scored, and lands in this view alongside web leads."
    />
  );
}
