import { NextResponse } from "next/server";
import { generateCoverLetter } from "@/lib/generators";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a bit before trying again." }, { status: 429 });
  }
  try {
    const { resume, jobPost } = (await req.json()) as { resume: string; jobPost: string };
    if (!resume?.trim() || !jobPost?.trim()) {
      return NextResponse.json({ error: "Please provide both your background and the job posting." }, { status: 400 });
    }
    const letter = await generateCoverLetter(resume, jobPost);
    return NextResponse.json({ letter });
  } catch (err) {
    console.error("[api/cover-letter] error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
