import { Briefcase } from "lucide-react";
import { Phase2Stub } from "../_components/Phase2Stub";

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
