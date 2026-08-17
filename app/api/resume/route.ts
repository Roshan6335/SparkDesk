import { NextResponse } from "next/server";
import { generateResume } from "@/lib/generators";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a bit before trying again." }, { status: 429 });
  }
  try {
    const { details } = (await req.json()) as { details: string };
    if (!details || details.trim().length < 10) {
      return NextResponse.json({ error: "Please share your work history / background." }, { status: 400 });
    }
    const content = await generateResume(details);
    return NextResponse.json({ content });
  } catch (err) {
    console.error("[api/resume] error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
