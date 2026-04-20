import type { Metadata } from "next";
import { Briefcase } from "lucide-react";
import { Phase2Stub } from "../_components/Phase2Stub";

export const metadata: Metadata = { title: "Job Applicants" };

export default function Page() {
  return (
    <Phase2Stub
      icon={Briefcase}
      title="Job Applicants"
      description="Careers funnel. Not in current scope."
      phase="Phase 3"
      sowRef="SOW section 3.4"
    />
  );
}
