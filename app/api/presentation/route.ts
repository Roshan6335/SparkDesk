import { NextResponse } from "next/server";
import { generatePresentation } from "@/lib/generators";
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
    const { topic, slideCount } = body as { topic: string; slideCount?: number };

    if (!topic || typeof topic !== "string" || topic.trim().length < 3) {
      return NextResponse.json({ error: "Please provide a topic (at least a few words)." }, { status: 400 });
    }

    const deck = await generatePresentation(topic, slideCount);
    return NextResponse.json(deck);
  } catch (err) {
    console.error("[api/presentation] error:", err);
    return NextResponse.json(
      { error: "Something went wrong generating the outline. Please try again." },
      { status: 500 }
    );
  }
}
