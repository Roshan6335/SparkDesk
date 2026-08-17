import { NextResponse } from "next/server";
import { generateSummary } from "@/lib/generators";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a bit before trying again." }, { status: 429 });
  }
  try {
    const { text } = (await req.json()) as { text: string };
    if (!text || text.trim().length < 20) {
      return NextResponse.json({ error: "Please paste at least a few sentences to summarize." }, { status: 400 });
    }
    const summary = await generateSummary(text);
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("[api/summarizer] error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
