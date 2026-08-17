import { NextResponse } from "next/server";
import { generatePodcastScript } from "@/lib/generators";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a bit before trying again." }, { status: 429 });
  }
  try {
    const { topic } = (await req.json()) as { topic: string };
    if (!topic || topic.trim().length < 3) {
      return NextResponse.json({ error: "Please provide a topic for the podcast." }, { status: 400 });
    }
    const script = await generatePodcastScript(topic);
    return NextResponse.json({ script });
  } catch (err) {
    console.error("[api/podcast] error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
