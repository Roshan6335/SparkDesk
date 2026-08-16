import { NextResponse } from "next/server";
import { generateCompletion } from "@/lib/ai-client";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

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
    const { messages } = body as { messages: { role: string; content: string }[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    // Cap history length to keep token usage sane
    const trimmed = messages.slice(-20);

    const systemPrompt = {
      role: "system" as const,
      content:
        "You are the SparkDesk AI Assistant — clear, direct, and helpful. Keep answers concise unless the user asks for depth.",
    };

    const reply = await generateCompletion({
      messages: [systemPrompt, ...trimmed] as any,
      temperature: 0.7,
      maxTokens: 1200,
    });

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[api/chat] error:", err);
    return NextResponse.json(
      { error: "Something went wrong generating a response. Please try again." },
      { status: 500 }
    );
  }
}
