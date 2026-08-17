import { NextResponse } from "next/server";
import { webSearch } from "@/lib/search-client";
import { generateFactCheckVerdict } from "@/lib/generators";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a bit before trying again." }, { status: 429 });
  }
  try {
    const { claim } = (await req.json()) as { claim: string };
    if (!claim || claim.trim().length < 5) {
      return NextResponse.json({ error: "Please enter a claim to check." }, { status: 400 });
    }

    const sources = await webSearch(claim);
    const verdict = await generateFactCheckVerdict(claim, sources);
    return NextResponse.json(verdict);
  } catch (err) {
    console.error("[api/fact-checker] error:", err);
    return NextResponse.json(
      { error: "Something went wrong checking that claim. Please try again." },
      { status: 500 }
    );
  }
}
