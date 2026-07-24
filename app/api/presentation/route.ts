import { NextResponse } from "next/server";
import { generateCompletion, repairAndParseJSON } from "@/lib/ai-client";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

type Slide = {
  title: string;
  bullets: string[];
  speakerNotes: string;
};

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
    const { topic, slideCount } = body as { topic: string; slideCount?: number };

    if (!topic || typeof topic !== "string" || topic.trim().length < 3) {
      return NextResponse.json({ error: "Please provide a topic (at least a few words)." }, { status: 400 });
    }

    const count = Math.min(Math.max(slideCount ?? 8, 4), 15);

    const systemPrompt = {
      role: "system" as const,
      content: `You generate presentation outlines for SparkDesk. Respond ONLY with valid JSON, no markdown fences, no preamble, matching exactly this shape:
{"title": string, "slides": [{"title": string, "bullets": string[], "speakerNotes": string}]}
Each slide should have 3-5 concise bullets and 1-2 sentences of speaker notes.`,
    };

    const userPrompt = {
      role: "user" as const,
      content: `Create a ${count}-slide presentation outline on: "${topic}".`,
    };

    const raw = await generateCompletion({
      messages: [systemPrompt, userPrompt] as any,
      temperature: 0.6,
      maxTokens: 2500,
      jsonMode: true,
    });

    const parsed = repairAndParseJSON<{ title: string; slides: Slide[] }>(raw);

    if (!parsed.slides || !Array.isArray(parsed.slides)) {
      throw new Error("Model output missing slides array");
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[api/presentation] error:", err);
    return NextResponse.json(
      { error: "Something went wrong generating the outline. Please try again." },
      { status: 500 }
    );
  }
}
