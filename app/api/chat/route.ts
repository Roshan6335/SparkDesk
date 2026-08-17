import { NextResponse } from "next/server";
import { generateCompletion, repairAndParseJSON } from "@/lib/ai-client";
import { generateDocument, generatePresentation } from "@/lib/generators";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

type IncomingMessage = { role: "user" | "assistant"; content: string };

type OrchestratorDecision = {
  action: "reply" | "generate_document" | "generate_presentation";
  reply?: string;
  topic?: string;
  style?: "document" | "bullet" | "exam";
  slideCount?: number;
};

const ORCHESTRATOR_PROMPT = `You are the routing brain behind SparkDesk's chat. Read the conversation and decide what the user actually wants, then respond with ONLY a JSON object (no markdown fences, no preamble) matching exactly this shape:

{"action": "reply" | "generate_document" | "generate_presentation", "reply": string, "topic": string, "style": "document" | "bullet" | "exam", "slideCount": number}

Rules:
- action = "generate_presentation" ONLY when the user clearly wants slides/a deck/a PPT AND you already know both the topic AND how many slides they want (from anywhere in the conversation, including earlier turns). If the slide count is not known yet, use action = "reply" and ask for it in "reply" (suggest a reasonable range like 6-10). Do not guess a slide count on your own.
- action = "generate_document" when the user wants notes/a document/a write-up/a summary written out AND you know the topic. "style" defaults to "document" unless they asked for bullet points or exam/study notes — infer it, don't ask.
- action = "reply" for everything else: normal conversation, clarifying questions, or when required info (topic, or slide count for presentations) is still missing. Put your natural reply text in "reply".
- When action is "generate_document" or "generate_presentation", "reply" should be a short one-line intro (e.g. "Here's your document:" or "Here's your deck:") — the actual content is generated separately, don't write it yourself.
- Only include "topic", "style", "slideCount" when relevant to the chosen action. Never fabricate a topic the user didn't give you.
- Keep "reply" concise, direct, and conversational — this is a chat, not an essay.`;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a bit before trying again." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { messages } = body as { messages: IncomingMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    // Cap history length to keep token usage sane
    const trimmed = messages.slice(-20);

    // Step 1 — classify intent + extract slots (topic / style / slideCount) from the whole conversation.
    const raw = await generateCompletion({
      messages: [{ role: "system", content: ORCHESTRATOR_PROMPT }, ...trimmed],
      temperature: 0.3,
      maxTokens: 400,
      jsonMode: true,
    });

    let decision: OrchestratorDecision;
    try {
      decision = repairAndParseJSON<OrchestratorDecision>(raw);
    } catch {
      // If the router itself fails to produce valid JSON, fall back to a plain reply
      // so the user still gets a useful answer instead of a hard error.
      const fallback = await generateCompletion({
        messages: [
          {
            role: "system",
            content: "You are the SparkDesk AI Assistant — clear, direct, and helpful.",
          },
          ...trimmed,
        ],
        temperature: 0.7,
        maxTokens: 1200,
      });
      return NextResponse.json({ type: "text", content: fallback });
    }

    // Step 2 — act on the decision.
    if (decision.action === "generate_document" && decision.topic) {
      const content = await generateDocument(decision.topic, decision.style);
      return NextResponse.json({
        type: "document",
        intro: decision.reply || "Here's your document:",
        topic: decision.topic,
        content,
      });
    }

    if (decision.action === "generate_presentation" && decision.topic) {
      const deck = await generatePresentation(decision.topic, decision.slideCount);
      return NextResponse.json({
        type: "presentation",
        intro: decision.reply || "Here's your presentation:",
        deck,
      });
    }

    // Default: plain conversational reply (includes the "need more info" case).
    return NextResponse.json({
      type: "text",
      content: decision.reply || "Could you tell me a bit more about what you need?",
    });
  } catch (err) {
    console.error("[api/chat] error:", err);
    return NextResponse.json(
      { error: "Something went wrong generating a response. Please try again." },
      { status: 500 }
    );
  }
}
