import { NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

type Slide = { title: string; bullets: string[]; speakerNotes: string };
type Deck = { title: string; slides: Slide[] };

const INK = "1A1A2E";
const MUTED = "6B6E85";
const WHITE = "FFFFFF";

// Rotating accent palette so the deck reads as colorful and varied,
// not a single-color template repeated on every slide.
const PALETTE = [
  { accent: "5B57F5", tint: "EEEDFD" }, // indigo
  { accent: "E8703A", tint: "FDEDE3" }, // warm orange
  { accent: "1FA971", tint: "E4F6ED" }, // teal green
  { accent: "3366E6", tint: "E7EDFC" }, // blue
  { accent: "9B4FE0", tint: "F3E9FC" }, // violet
];

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

    const titleAccent = PALETTE[0].accent;

    // --- Title slide: solid color background + soft decorative circles ---
    const titleSlide = pres.addSlide();
    titleSlide.background = { color: titleAccent };

    // Decorative circles (low-opacity), not edge stripes — pure ornamentation
    titleSlide.addShape(pres.ShapeType.ellipse, {
      x: 10.6, y: -1.8, w: 5, h: 5,
      fill: { color: WHITE, transparency: 90 },
      line: { type: "none" },
    });
    titleSlide.addShape(pres.ShapeType.ellipse, {
      x: -1.5, y: 5.2, w: 3.6, h: 3.6,
      fill: { color: WHITE, transparency: 92 },
      line: { type: "none" },
    });

    titleSlide.addText(body.title || "Untitled Presentation", {
      x: 0.9, y: 2.9, w: 11.5, h: 1.7,
      fontSize: 40, bold: true, color: WHITE, fontFace: "Arial", margin: 0,
    });
    titleSlide.addText("Generated with SparkDesk", {
      x: 0.9, y: 4.35, w: 8, h: 0.5,
      fontSize: 14, color: WHITE, transparency: 25, fontFace: "Arial", margin: 0,
    });

    // --- Content slides ---
    body.slides.forEach((slide, idx) => {
      const palette = PALETTE[idx % PALETTE.length];
      const s = pres.addSlide();
      s.background = { color: WHITE };

      // Small decorative accent circle, top-right corner (ornament, not an edge stripe)
      s.addShape(pres.ShapeType.ellipse, {
        x: 12.6, y: -0.6, w: 1.6, h: 1.6,
        fill: { color: palette.tint },
        line: { type: "none" },
      });

      // Kicker label + slide number
      s.addText(`SLIDE ${idx + 1} OF ${body.slides.length}`, {
        x: 0.7, y: 0.45, w: 6, h: 0.35,
        fontSize: 11, bold: true, color: palette.accent, fontFace: "Arial",
        charSpacing: 1, margin: 0,
      });

      // Title
      s.addText(slide.title, {
        x: 0.7, y: 0.8, w: 11.9, h: 0.9,
        fontSize: 30, bold: true, color: INK, fontFace: "Arial", margin: 0,
      });

      // Content card: soft tinted rounded rectangle behind the bullets
      const cardY = 2.0;
      const cardH = 5.0;
      s.addShape(pres.ShapeType.roundRect, {
        x: 0.7, y: cardY, w: 11.9, h: cardH,
        rectRadius: 0.12,
        fill: { color: palette.tint },
        line: { type: "none" },
      });

      const bulletItems = slide.bullets.map((b, i) => ({
        text: b,
        options: {
          bullet: { code: "25CF" },
          breakLine: i !== slide.bullets.length - 1,
          paraSpaceAfter: 16,
          fontSize: 18,
          color: INK,
          fontFace: "Arial",
        },
      }));

      s.addText(bulletItems, {
        x: 1.1, y: cardY + 0.45, w: 11.1, h: cardH - 0.9,
        valign: "top", margin: 0,
      });

      if (slide.speakerNotes) {
        s.addNotes(slide.speakerNotes);
      }
    });

    // --- Closing slide ---
    const closing = pres.addSlide();
    closing.background = { color: INK };
    closing.addShape(pres.ShapeType.ellipse, {
      x: -1.8, y: -1.8, w: 5, h: 5,
      fill: { color: titleAccent, transparency: 60 },
      line: { type: "none" },
    });
    closing.addText("Thank You", {
      x: 0.9, y: 3.1, w: 11.5, h: 1.2,
      fontSize: 36, bold: true, color: WHITE, fontFace: "Arial", margin: 0,
    });
    closing.addText("Made with SparkDesk", {
      x: 0.9, y: 4.2, w: 8, h: 0.5,
      fontSize: 13, color: "B8BAC9", fontFace: "Arial", margin: 0,
    });

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
