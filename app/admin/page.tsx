import { redirect } from "next/navigation";

// Legacy admin entry point — the new app shell lives at /app.
export default function AdminRedirect() {
  redirect("/app/conversations");
}
