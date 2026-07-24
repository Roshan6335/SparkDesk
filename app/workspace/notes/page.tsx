"use client";

import { useState } from "react";
import { FileText, Loader2, Sparkles } from "lucide-react";

const STYLES = [
  { value: "document", label: "Structured document" },
  { value: "bullet", label: "Bullet-point notes" },
  { value: "exam", label: "Exam-ready study notes" },
];

export default function NotesPage() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("document");
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError(null);
    setContent(null);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, style }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setContent(data.content);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient-soft text-brand-600">
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900">AI Notes & Document Generator</h1>
          <p className="text-sm text-ink-500">Turn a topic into a clean, structured document.</p>
        </div>
      </div>

      <div className="rounded-xl2 border border-surface-border bg-white p-6 shadow-card">
        <label className="mb-2 block text-sm font-medium text-ink-700">Topic</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          placeholder="e.g. Photosynthesis for a Class 10 student, or Key clauses in a rental agreement"
          className="w-full resize-none rounded-lg border border-surface-border bg-surface-soft px-4 py-3 text-sm text-ink-900 outline-none focus:border-brand-400"
        />

        <label className="mb-2 mt-4 block text-sm font-medium text-ink-700">Format</label>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStyle(s.value)}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                style === s.value
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-surface-border text-ink-500 hover:border-brand-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="mt-5 flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card disabled:opacity-40"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Generating..." : "Generate document"}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl2 border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {content && (
        <div className="mt-6 rounded-xl2 border border-surface-border bg-white p-6 shadow-card">
          <MarkdownLite text={content} />
        </div>
      )}
    </div>
  );
}

/**
 * Minimal markdown renderer for headings, bullets, and bold text —
 * avoids pulling in a full markdown library for MVP.
 */
function MarkdownLite({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="prose-sparkdesk">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("## ")) {
          return <h2 key={i}>{trimmed.replace("## ", "")}</h2>;
        }
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <ul key={i}>
              <li dangerouslySetInnerHTML={{ __html: boldify(trimmed.slice(2)) }} />
            </ul>
          );
        }
        if (trimmed === "") return null;
        return <p key={i} dangerouslySetInnerHTML={{ __html: boldify(trimmed) }} />;
      })}
    </div>
  );
}

function boldify(s: string) {
  return s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}
