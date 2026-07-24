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
    const { topic, style } = body as { topic: string; style?: string };

    if (!topic || typeof topic !== "string" || topic.trim().length < 3) {
      return NextResponse.json({ error: "Please provide a topic (at least a few words)." }, { status: 400 });
    }

    const styleInstruction =
      style === "bullet"
        ? "Format as clean bullet-point notes with short sub-bullets where useful."
        : style === "exam"
        ? "Format as exam-ready study notes: definitions, key points, and a short summary at the end."
        : "Format as a well-structured document with clear headings and short paragraphs.";

    const systemPrompt = {
      role: "system" as const,
      content:
        "You are SparkDesk's document generator. Produce clean, well-organized markdown output. Use headings (##), bullet points, and bold for key terms where helpful. Do not add meta-commentary about being an AI.",
    };

    const userPrompt = {
      role: "user" as const,
      content: `Write a clear, well-structured document on the following topic: "${topic}". ${styleInstruction}`,
    };

    const content = await generateCompletion({
      messages: [systemPrompt, userPrompt] as any,
      temperature: 0.6,
      maxTokens: 2000,
    });

    return NextResponse.json({ content });
  } catch (err) {
    console.error("[api/notes] error:", err);
    return NextResponse.json(
      { error: "Something went wrong generating the document. Please try again." },
      { status: 500 }
    );
  }
}
