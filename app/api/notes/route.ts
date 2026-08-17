import { NextResponse } from "next/server";
import { generateDocument } from "@/lib/generators";
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

    const content = await generateDocument(topic, style);
    return NextResponse.json({ content });
  } catch (err) {
    console.error("[api/notes] error:", err);
    return NextResponse.json(
      { error: "Something went wrong generating the document. Please try again." },
      { status: 500 }
    );
  }
}
