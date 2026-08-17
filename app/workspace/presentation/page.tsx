"use client";

import { useState } from "react";
import { Presentation, Loader2, Sparkles, ChevronDown, ChevronUp, Download } from "lucide-react";

type Slide = { title: string; bullets: string[]; speakerNotes: string };
type Deck = { title: string; slides: Slide[] };

export default function PresentationPage() {
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(8);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  async function handleExport() {
    if (!deck || exporting) return;
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

  async function handleGenerate() {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError(null);
    setDeck(null);

    try {
      const res = await fetch("/api/presentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, slideCount }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setDeck(data);
      setExpanded(0);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-brand-gradient-soft text-brand-400">
          <Presentation className="h-4 w-4" />
        </div>
        <div>
          <h1 className="font-display text-xl font-normal text-ink-900">AI Slides</h1>
          <p className="text-sm text-ink-500">
            Generate a slide-by-slide outline with speaker notes, then export straight to PowerPoint.
          </p>
        </div>
      </div>

      <div className="rounded-xl2 border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl backdrop-saturate-150">
        <label className="mb-2 block text-sm font-medium text-ink-700">Topic</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          placeholder="e.g. Introduction to the Indian Constitution for Class 10 students"
          className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-500 focus:border-brand-400"
        />

        <label className="mb-2 mt-4 block text-sm font-medium text-ink-700">
          Number of slides: {slideCount}
        </label>
        <input
          type="range"
          min={4}
          max={15}
          value={slideCount}
          onChange={(e) => setSlideCount(Number(e.target.value))}
          className="w-full accent-brand-500"
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="mt-5 flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Generating..." : "Generate outline"}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl2 border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {deck && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-normal text-ink-900">{deck.title}</h2>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/15 px-4 py-2 text-xs font-semibold text-brand-300 transition-colors hover:bg-brand-500/25 disabled:opacity-40"
            >
              {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {exporting ? "Exporting..." : "Export to PPTX"}
            </button>
          </div>
          {exportError && (
            <div className="mb-4 rounded-xl2 border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-300">
              {exportError}
            </div>
          )}
          <div className="space-y-3">
            {deck.slides.map((slide, i) => (
              <div
                key={i}
                className="rounded-xl2 border border-white/10 bg-white/[0.03] backdrop-blur-xl backdrop-saturate-150 transition-colors hover:bg-white/[0.05]"
              >
                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-ink-900">
                    {i + 1}. {slide.title}
                  </span>
                  {expanded === i ? (
                    <ChevronUp className="h-4 w-4 text-ink-300" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-ink-300" />
                  )}
                </button>
                {expanded === i && (
                  <div className="border-t border-white/10 px-5 py-4">
                    <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-ink-700">
                      {slide.bullets.map((b, bi) => (
                        <li key={bi}>{b}</li>
                      ))}
                    </ul>
                    <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs italic text-ink-500">
                      Speaker notes: {slide.speakerNotes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
