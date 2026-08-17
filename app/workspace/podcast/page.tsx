"use client";

import { useState } from "react";
import { Mic, Loader2, Sparkles, Download, Volume2 } from "lucide-react";

export default function PodcastPage() {
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  async function handleGenerateScript() {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError(null);
    setScript(null);
    setAudioUrl(null);
    try {
      const res = await fetch("/api/podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setScript(data.script);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAudio() {
    if (!script || audioLoading) return;
    setAudioLoading(true);
    setAudioError(null);
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: script }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAudioError(data.error || "Something went wrong generating audio.");
        return;
      }
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
    } catch {
      setAudioError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setAudioLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-brand-gradient-soft text-brand-400">
          <Mic className="h-4 w-4" />
        </div>
        <div>
          <h1 className="font-display text-xl font-normal text-ink-900">AI Podcast</h1>
          <p className="text-sm text-ink-500">Turn a topic into a script — then narrate it.</p>
        </div>
      </div>

      <div className="rounded-xl2 border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl backdrop-saturate-150">
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          placeholder="e.g. Why sleep matters more than people think"
          className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-500 focus:border-brand-400"
        />
        <button
          onClick={handleGenerateScript}
          disabled={loading || !topic.trim()}
          className="mt-4 flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Writing script..." : "Generate script"}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl2 border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {script && (
        <div className="mt-6">
          <div className="rounded-xl2 border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl backdrop-saturate-150">
            <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-ink-300">Script</span>
            <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink-700">{script}</p>
          </div>

          <button
            onClick={handleGenerateAudio}
            disabled={audioLoading}
            className="mt-4 flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/15 px-5 py-2.5 text-sm font-semibold text-brand-300 transition-colors hover:bg-brand-500/25 disabled:opacity-40"
          >
            {audioLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
            {audioLoading ? "Narrating..." : "Generate audio narration"}
          </button>

          {audioError && (
            <div className="mt-4 rounded-xl2 border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              {audioError}
            </div>
          )}

          {audioUrl && (
            <div className="mt-4 rounded-xl2 border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl backdrop-saturate-150">
              <audio controls src={audioUrl} className="w-full" />
              <a
                href={audioUrl}
                download="sparkdesk-podcast.mp3"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/15 px-4 py-2 text-xs font-semibold text-brand-300 transition-colors hover:bg-brand-500/25"
              >
                <Download className="h-3.5 w-3.5" />
                Download MP3
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
