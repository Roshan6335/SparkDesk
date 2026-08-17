import { NextResponse } from "next/server";
import { generateImage } from "@/lib/image-client";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a bit before trying again." }, { status: 429 });
  }
  try {
    const { prompt, aspect } = (await req.json()) as { prompt: string; aspect?: "square" | "wide" | "tall" };
    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json({ error: "Please describe the image you want." }, { status: 400 });
    }

    const dims =
      aspect === "wide" ? { width: 1280, height: 720 } : aspect === "tall" ? { width: 768, height: 1024 } : { width: 1024, height: 1024 };

    const url = await generateImage(prompt, dims);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[api/image] error:", err);
    return NextResponse.json({ error: "Something went wrong generating the image. Please try again." }, { status: 500 });
  }
}
