import { NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

type Slide = { title: string; bullets: string[]; speakerNotes: string };
type Deck = { title: string; slides: Slide[] };

const BRAND_PRIMARY = "5B57F5"; // no '#', per pptxgenjs rules
const BRAND_INK = "101223";
const BRAND_MUTED = "6B6E85";

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
    const body = (await req.json()) as Deck;

    if (!body?.slides || !Array.isArray(body.slides) || body.slides.length === 0) {
      return NextResponse.json({ error: "A deck with at least one slide is required." }, { status: 400 });
    }

    const pres = new PptxGenJS();
    pres.layout = "LAYOUT_WIDE"; // 13.3" x 7.5"

    // --- Title slide ---
    const titleSlide = pres.addSlide();
    titleSlide.background = { color: "FFFFFF" };
    titleSlide.addText(body.title || "Untitled Presentation", {
      x: 0.7,
      y: 2.7,
      w: 11.9,
      h: 1.5,
      fontSize: 36,
      bold: true,
      color: BRAND_INK,
      fontFace: "Arial",
      margin: 0,
    });
    titleSlide.addText("Generated with SparkDesk", {
      x: 0.7,
      y: 4.1,
      w: 8,
      h: 0.5,
      fontSize: 14,
      color: BRAND_MUTED,
      fontFace: "Arial",
      margin: 0,
    });
    titleSlide.addShape(pres.ShapeType.rect, {
      x: 0.7,
      y: 2.5,
      w: 0.9,
      h: 0.08,
      fill: { color: BRAND_PRIMARY },
      line: { type: "none" },
    });

    // --- Content slides ---
    for (const slide of body.slides) {
      const s = pres.addSlide();
      s.background = { color: "FFFFFF" };

      s.addText(slide.title, {
        x: 0.7,
        y: 0.5,
        w: 11.9,
        h: 0.9,
        fontSize: 28,
        bold: true,
        color: BRAND_INK,
        fontFace: "Arial",
        margin: 0,
      });

      const bulletItems = slide.bullets.map((b, i) => ({
        text: b,
        options: {
          bullet: true,
          breakLine: i !== slide.bullets.length - 1,
          paraSpaceAfter: 12,
          fontSize: 18,
          color: BRAND_INK,
          fontFace: "Arial",
        },
      }));

      s.addText(bulletItems, {
        x: 0.9,
        y: 1.7,
        w: 11.3,
        h: 5,
        valign: "top",
        margin: 0,
      });

      if (slide.speakerNotes) {
        s.addNotes(slide.speakerNotes);
      }
    }

    const buffer = (await pres.write({ outputType: "nodebuffer" })) as Buffer;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${sanitizeFilename(body.title)}.pptx"`,
      },
    });
  } catch (err) {
    console.error("[api/export-pptx] error:", err);
    return NextResponse.json(
      { error: "Something went wrong generating the PPTX file. Please try again." },
      { status: 500 }
    );
  }
}

function sanitizeFilename(name: string): string {
  const base = (name || "presentation").replace(/[^a-z0-9\-_ ]/gi, "").trim();
  return base.length > 0 ? base.slice(0, 60) : "presentation";
}
