"use client";

import { useState } from "react";
import { Image as ImageIcon, Loader2, Sparkles, ExternalLink } from "lucide-react";

const ASPECTS = [
  { value: "square", label: "Square" },
  { value: "wide", label: "Wide" },
  { value: "tall", label: "Tall" },
] as const;

export default function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState<"square" | "wide" | "tall">("square");
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setUrl(null);
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspect }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setUrl(data.url);
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
          <ImageIcon className="h-4 w-4" />
        </div>
        <div>
          <h1 className="font-display text-xl font-normal text-ink-900">AI Image</h1>
          <p className="text-sm text-ink-500">Describe an image — get it generated in seconds.</p>
        </div>
      </div>

      <div className="rounded-xl2 border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl backdrop-saturate-150">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="e.g. A minimalist workspace with a laptop and a cup of coffee, soft morning light"
          className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-500 focus:border-brand-400"
        />
        <div className="mt-3 flex gap-2">
          {ASPECTS.map((a) => (
            <button
              key={a.value}
              onClick={() => setAspect(a.value)}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                aspect === a.value ? "border-brand-400 bg-brand-500/15 text-brand-300" : "border-white/10 text-ink-500 hover:border-brand-400/50"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="mt-4 flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Generating..." : "Generate image"}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl2 border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {url && (
        <div className="mt-6">
          <div className="mb-3 flex justify-end">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/15 px-4 py-2 text-xs font-semibold text-brand-300 transition-colors hover:bg-brand-500/25"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open full image
            </a>
          </div>
          <div className="overflow-hidden rounded-xl2 border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={prompt} className="w-full rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}
