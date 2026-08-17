import { NextResponse } from "next/server";
import { generateDashboardData } from "@/lib/generators";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a bit before trying again." }, { status: 429 });
  }
  try {
    const { prompt } = (await req.json()) as { prompt: string };
    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json({ error: "Please describe the dashboard you need." }, { status: 400 });
    }
    const dashboard = await generateDashboardData(prompt);
    return NextResponse.json(dashboard);
  } catch (err) {
    console.error("[api/dashboard] error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
