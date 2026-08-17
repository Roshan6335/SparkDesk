import { NextResponse } from "next/server";
import { generateFlowchart } from "@/lib/generators";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a bit before trying again." }, { status: 429 });
  }
  try {
    const { process } = (await req.json()) as { process: string };
    if (!process || process.trim().length < 5) {
      return NextResponse.json({ error: "Please describe the process." }, { status: 400 });
    }
    const flowchart = await generateFlowchart(process);
    return NextResponse.json(flowchart);
  } catch (err) {
    console.error("[api/flowchart] error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
