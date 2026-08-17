"use client";

import { useState } from "react";
import { Workflow, Loader2, Sparkles } from "lucide-react";
import { FlowchartRenderer } from "@/components/FlowchartRenderer";

type FlowchartData = { title: string; mermaid: string };

export default function FlowchartPage() {
  const [process, setProcess] = useState("");
  const [flowchart, setFlowchart] = useState<FlowchartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!process.trim() || loading) return;
    setLoading(true);
    setError(null);
    setFlowchart(null);
    try {
      const res = await fetch("/api/flowchart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ process }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setFlowchart(data);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-brand-gradient-soft text-brand-400">
          <Workflow className="h-4 w-4" />
        </div>
        <div>
          <h1 className="font-display text-xl font-normal text-ink-900">AI Flowchart</h1>
          <p className="text-sm text-ink-500">Describe a process — get a clean flowchart back.</p>
        </div>
      </div>

      <div className="rounded-xl2 border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl backdrop-saturate-150">
        <textarea
          value={process}
          onChange={(e) => setProcess(e.target.value)}
          rows={4}
          placeholder="e.g. Our customer support ticket workflow, from submission to resolution"
          className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-500 focus:border-brand-400"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !process.trim()}
          className="mt-4 flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Mapping..." : "Generate flowchart"}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl2 border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {flowchart && (
        <div className="mt-6">
          <h2 className="mb-4 font-display text-lg font-normal text-ink-900">{flowchart.title}</h2>
          <div className="overflow-hidden rounded-xl2 border border-white/10 bg-white p-6 shadow-card-hover">
            <FlowchartRenderer definition={flowchart.mermaid} />
          </div>
        </div>
      )}
    </div>
  );
}
