// TODO: Wire up Supabase storage (lib/supabase/) to persist leads
// TODO: Wire up Resend email (lib/email/) to notify facility admissions team

export const runtime = "edge";

interface LeadRequest {
  name?: string;
  phone?: string;
  email?: string;
  facilityId: string;
  careFor?: string;
  careType?: string;
  timeline?: string;
  conversationSummary?: string;
}

export async function POST(req: Request): Promise<Response> {
  let body: LeadRequest;

  try {
    body = (await req.json()) as LeadRequest;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body.facilityId) {
    return new Response(JSON.stringify({ error: "facilityId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const leadId = crypto.randomUUID();

  // Log lead to console until persistence layer is wired up
  console.log("[LEAD CAPTURED]", {
    leadId,
    timestamp: new Date().toISOString(),
    facilityId: body.facilityId,
    name: body.name,
    phone: body.phone,
    email: body.email,
    careFor: body.careFor,
    careType: body.careType,
    timeline: body.timeline,
    conversationSummary: body.conversationSummary,
  });

  return new Response(JSON.stringify({ success: true, leadId }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
