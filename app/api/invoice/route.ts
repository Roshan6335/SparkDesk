import { NextResponse } from "next/server";
import { generateInvoiceData } from "@/lib/generators";
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
    if (!details || details.trim().length < 5) {
      return NextResponse.json({ error: "Please describe the invoice you need." }, { status: 400 });
    }
    const invoice = await generateInvoiceData(details);
    return NextResponse.json(invoice);
  } catch (err) {
    console.error("[api/invoice] error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
