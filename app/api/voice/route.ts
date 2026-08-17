import { NextResponse } from "next/server";
import { textToSpeech } from "@/lib/tts-client";
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
    if (!text || text.trim().length < 2) {
      return NextResponse.json({ error: "Please enter some text to convert to speech." }, { status: 400 });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: "Voice generation isn't configured yet — ELEVENLABS_API_KEY is missing." },
        { status: 503 }
      );
    }

    const audio = await textToSpeech(text);
    return new NextResponse(audio, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (err) {
    console.error("[api/voice] error:", err);
    return NextResponse.json({ error: "Something went wrong generating audio. Please try again." }, { status: 500 });
  }
}
