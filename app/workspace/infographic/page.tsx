"use client";

import { useRef, useState } from "react";
import { BarChart3, Loader2, Sparkles, Download } from "lucide-react";

type InfographicData = { title: string; stats: { label: string; value: string }[]; points: string[] };

export default function InfographicPage() {
  const [prompt, setPrompt] = useState("");
  const [data, setData] = useState<InfographicData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  async function handleGenerate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/infographic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }
      setData(json);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPng() {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(data?.title || "infographic").replace(/[^a-z0-9\-_ ]/gi, "").trim() || "infographic"}.png`;
      a.click();
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-brand-gradient-soft text-brand-400">
          <BarChart3 className="h-4 w-4" />
        </div>
        <div>
          <h1 className="font-display text-xl font-normal text-ink-900">AI Infographic</h1>
          <p className="text-sm text-ink-500">Turn data or ideas into a shareable, visual card.</p>
        </div>
      </div>

      <div className="rounded-xl2 border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl backdrop-saturate-150">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="e.g. Key stats about remote work productivity in 2026"
          className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-500 focus:border-brand-400"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="mt-4 flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Designing..." : "Generate infographic"}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl2 border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {data && (
        <div className="mt-6">
          <div className="mb-3 flex justify-end">
            <button
              onClick={handleDownloadPng}
              disabled={exporting}
              className="flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/15 px-4 py-2 text-xs font-semibold text-brand-300 transition-colors hover:bg-brand-500/25 disabled:opacity-40"
            >
              {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {exporting ? "Preparing..." : "Download PNG"}
            </button>
          </div>
          <div ref={cardRef} className="overflow-hidden rounded-xl2 bg-brand-gradient p-8 text-white shadow-card-hover">
            <h2 className="font-display text-2xl font-normal">{data.title}</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {data.stats.map((s, i) => (
                <div key={i} className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="font-display text-2xl font-normal">{s.value}</div>
                  <div className="mt-1 text-xs text-white/80">{s.label}</div>
                </div>
              ))}
            </div>
            <ul className="mt-6 space-y-2">
              {data.points.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/90">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
