import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import { after } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { getFacilityById, getFacilityByHostname } from "@/lib/facilities/data";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { upsertLead, type LeadRow } from "@/lib/db/supabase";
import { sendLeadEmail } from "@/lib/notifications/email";
import { scoreLead } from "@/lib/leads/scoring";

export const runtime = "edge";

// How many bytes to hold back at the tail of the stream.
// A full <lead_data> block is at most ~500 chars — 700 gives comfortable margin.
const TAIL_BUFFER = 700;

interface ChatRequest {
  messages: UIMessage[];
  facilityId?: string;
  hostname?: string;
  sessionId?: string;
}

// Extract a <lead_data>…</lead_data> block from the END of the text.
// Returns cleaned text (block removed) and parsed JSON (or null).
function extractLeadData(text: string): {
  clean: string;
  lead: Record<string, string> | null;
} {
  const start = text.indexOf("<lead_data>");
  if (start === -1) return { clean: text, lead: null };

  const end = text.indexOf("</lead_data>", start);
  if (end === -1) return { clean: text, lead: null }; // incomplete block — leave as-is

  let lead: Record<string, string> | null = null;
  try {
    lead = JSON.parse(text.slice(start + "<lead_data>".length, end)) as Record<string, string>;
  } catch {
    // malformed JSON — still strip the tag
  }

  const clean = (text.slice(0, start) + text.slice(end + "</lead_data>".length)).trimEnd();
  return { clean, lead };
}

export async function POST(req: Request): Promise<Response> {
  let body: ChatRequest;

  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, facilityId, hostname, sessionId } = body;

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "messages array is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const facility =
    (facilityId ? getFacilityById(facilityId) : null) ??
    (hostname ? getFacilityByHostname(hostname) : null);

  if (!facility) {
    return new Response(
      JSON.stringify({ error: "Facility not found. Provide a valid facilityId or hostname." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const systemPrompt = buildSystemPrompt(facility);
  const modelMessages = await convertToModelMessages(messages);

  let result: ReturnType<typeof streamText>;
  try {
    result = streamText({
      model: anthropic("claude-sonnet-4-5"),
      system: systemPrompt,
      messages: modelMessages,
      maxOutputTokens: 400,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "AI service error", detail }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── Schedule lead extraction + Supabase upsert after the response is sent ──
  // result.text resolves with the full AI output after the stream completes.
  // after() defers this work until after the Response is fully sent, keeping
  // the Edge worker alive long enough to finish.
  if (sessionId) {
    after(async () => {
      try {
        const fullText = await result.text;
        const { lead } = extractLeadData(fullText);
        if (!lead) return;

        const row: LeadRow = {
          session_id: sessionId,
          facility_slug: lead.facility_id || facility.id,
          facility_name: lead.facility_name || facility.name,
          visitor_name: lead.visitor_name || null,
          visitor_phone: lead.visitor_phone || null,
          visitor_email: lead.visitor_email || null,
          patient_name: lead.patient_name || null,
          patient_relationship: lead.patient_relationship || null,
          care_type_interest: lead.care_type_interest || null,
          current_situation: lead.current_situation || null,
          insurance_type: lead.insurance_type || null,
          timeline: lead.timeline || null,
          hospital_name: lead.hospital_name || null,
          referral_source: lead.referral_source || null,
          audience_type: lead.audience_type || null,
          conversation_summary: lead.conversation_summary || null,
          raw_lead_json: lead as Record<string, unknown>,
          // Tour scheduling (AL/MC only — null if not captured)
          tour_requested: lead.tour_requested === "true" ? true : (lead.tour_requested === "false" ? false : null),
          tour_preferred_time: lead.tour_preferred_time || null,
        };

        // Score the lead before upserting so the score is persisted
        row.lead_score = scoreLead(row);

        await Promise.allSettled([
          upsertLead(row),
          sendLeadEmail(row),
        ]);
      } catch (err) {
        console.error("[lead processing error]", err);
      }
    });
  }

  // ── Tail-buffered stream — strips <lead_data> before it reaches the client ─
  // We hold back the last TAIL_BUFFER bytes. When the upstream closes we run
  // extractLeadData on the tail and flush only the clean portion.
  const encoder = new TextEncoder();
  let tail = "";

  const responseStream = new ReadableStream({
    async start(ctrl) {
      try {
        for await (const chunk of result.textStream) {
          tail += chunk;
          if (tail.length > TAIL_BUFFER) {
            const toFlush = tail.slice(0, tail.length - TAIL_BUFFER);
            ctrl.enqueue(encoder.encode(toFlush));
            tail = tail.slice(tail.length - TAIL_BUFFER);
          }
        }
        // Stream ended — strip any lead_data tag and flush remaining clean text
        const { clean } = extractLeadData(tail);
        if (clean) ctrl.enqueue(encoder.encode(clean));
        ctrl.close();
      } catch (err) {
        ctrl.error(err);
      }
    },
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
      "Cache-Control": "no-cache",
    },
  });
}
