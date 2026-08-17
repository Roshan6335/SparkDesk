"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Loader2, Sparkles } from "lucide-react";

type FactCheckResult = {
  verdict: "true" | "false" | "misleading" | "unverifiable";
  explanation: string;
  sources: { title: string; url: string }[];
};

const VERDICT_META = {
  true: { label: "True", icon: CheckCircle2, className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
  false: { label: "False", icon: XCircle, className: "border-red-500/30 bg-red-500/10 text-red-300" },
  misleading: { label: "Misleading", icon: AlertTriangle, className: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
  unverifiable: { label: "Unverifiable", icon: HelpCircle, className: "border-white/15 bg-white/5 text-ink-300" },
};

export default function FactCheckerPage() {
  const [claim, setClaim] = useState("");
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck() {
    if (!claim.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/fact-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setResult(data);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const meta = result ? VERDICT_META[result.verdict] : null;
  const VerdictIcon = meta?.icon;

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-brand-gradient-soft text-brand-400">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div>
          <h1 className="font-display text-xl font-normal text-ink-900">AI Fact Checker</h1>
          <p className="text-sm text-ink-500">Cross-checks a claim against live web sources.</p>
        </div>
      </div>

      <div className="rounded-xl2 border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl backdrop-saturate-150">
        <textarea
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          rows={3}
          placeholder="e.g. The Great Wall of China is visible from space with the naked eye"
          className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-500 focus:border-brand-400"
        />
        <button
          onClick={handleCheck}
          disabled={loading || !claim.trim()}
          className="mt-4 flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Checking..." : "Check claim"}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl2 border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && meta && VerdictIcon && (
        <div className="mt-6 rounded-xl2 border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl backdrop-saturate-150">
          <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${meta.className}`}>
            <VerdictIcon className="h-4 w-4" />
            {meta.label}
          </div>
          <p className="text-[14.5px] leading-relaxed text-ink-700">{result.explanation}</p>

          {result.sources.length > 0 && (
            <div className="mt-5 border-t border-white/10 pt-4">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-300">Sources</span>
              <ul className="space-y-1.5">
                {result.sources.map((s, i) => (
                  <li key={i}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[13px] text-brand-300 underline decoration-brand-400/40 underline-offset-2 hover:text-brand-200"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
