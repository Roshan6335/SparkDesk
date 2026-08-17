"use client";

import { useState } from "react";
import { Presentation, Download, Loader2, ChevronDown, ChevronUp } from "lucide-react";

type Slide = { title: string; bullets: string[]; speakerNotes: string };
type Deck = { title: string; slides: Slide[] };

export function PresentationCard({ deck }: { deck: Deck }) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    setExportError(null);

    try {
      const res = await fetch("/api/export-pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deck),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setExportError(data.error || "Something went wrong exporting the file.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(deck.title || "presentation").replace(/[^a-z0-9\-_ ]/gi, "").trim() || "presentation"}.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="max-w-[85%] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2 text-ink-700">
          <Presentation className="h-4 w-4 text-brand-400" />
          <span className="text-xs font-medium uppercase tracking-wide text-ink-300">
            Presentation · {deck.slides.length} slides
          </span>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-1.5 rounded-full border border-brand-400/40 bg-brand-500/15 px-3 py-1.5 text-[11px] font-semibold text-brand-300 transition-colors hover:bg-brand-500/25 disabled:opacity-40"
        >
          {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
          {exporting ? "Exporting..." : "Export PPTX"}
        </button>
      </div>

      <div className="px-4 py-3">
        <h3 className="mb-2 font-display text-base font-normal text-ink-900">{deck.title}</h3>
        {exportError && (
          <div className="mb-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {exportError}
          </div>
        )}
        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {deck.slides.map((slide, i) => (
            <div key={i} className="rounded-lg border border-white/10 bg-white/[0.03]">
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="flex w-full items-center justify-between px-3 py-2 text-left"
              >
                <span className="text-[13px] font-medium text-ink-900">
                  {i + 1}. {slide.title}
                </span>
                {expanded === i ? (
                  <ChevronUp className="h-3.5 w-3.5 text-ink-300" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-ink-300" />
                )}
              </button>
              {expanded === i && (
                <div className="border-t border-white/10 px-3 py-2">
                  <ul className="list-disc space-y-0.5 pl-4 text-[12.5px] text-ink-700">
                    {slide.bullets.map((b, bi) => (
                      <li key={bi}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
