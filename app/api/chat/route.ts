import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getFacilityById, getFacilityByHostname } from "@/lib/facilities/data";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";

export const runtime = "edge";

interface ChatRequest {
  messages: UIMessage[];
  facilityId?: string;
  hostname?: string;
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

  const { messages, facilityId, hostname } = body;

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "messages array is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Resolve facility — try facilityId first, then hostname
  const facility =
    (facilityId ? getFacilityById(facilityId) : null) ??
    (hostname ? getFacilityByHostname(hostname) : null);

  if (!facility) {
    return new Response(
      JSON.stringify({
        error: "Facility not found. Provide a valid facilityId or hostname.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const systemPrompt = buildSystemPrompt(facility);
  const modelMessages = await convertToModelMessages(messages);

  try {
    const result = streamText({
      model: anthropic("claude-sonnet-4-5"),
      system: systemPrompt,
      messages: modelMessages,
      maxOutputTokens: 400,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "AI service error", detail: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
