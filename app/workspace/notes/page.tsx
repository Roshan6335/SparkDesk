"use client";

import { useState, useRef } from "react";
import { FileText, Loader2, Sparkles, Download } from "lucide-react";

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
  const [exporting, setExporting] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

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

  async function handleDownloadPdf() {
    if (!docRef.current || exporting) return;
    setExporting(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const canvas = await html2canvas(docRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = (topic || "document").replace(/[^a-z0-9\-_ ]/gi, "").trim().slice(0, 60) || "document";
      pdf.save(`${filename}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-brand-gradient-soft text-brand-400">
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <h1 className="font-display text-xl font-normal text-ink-900">AI Docs</h1>
          <p className="text-sm text-ink-500">Turn a topic into a clean, professionally designed document.</p>
        </div>
      </div>

      <div className="rounded-xl2 border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl backdrop-saturate-150">
        <label className="mb-2 block text-sm font-medium text-ink-700">Topic</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          placeholder="e.g. Photosynthesis for a Class 10 student, or Key clauses in a rental agreement"
          className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-500 focus:border-brand-400"
        />

        <label className="mb-2 mt-4 block text-sm font-medium text-ink-700">Format</label>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStyle(s.value)}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                style === s.value
                  ? "border-brand-400 bg-brand-500/15 text-brand-300"
                  : "border-white/10 text-ink-500 hover:border-brand-400/50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="mt-5 flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Generating..." : "Generate document"}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl2 border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {content && (
        <div className="mt-6">
          <div className="mb-3 flex justify-end">
            <button
              onClick={handleDownloadPdf}
              disabled={exporting}
              className="flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/15 px-4 py-2 text-xs font-semibold text-brand-300 transition-colors hover:bg-brand-500/25 disabled:opacity-40"
            >
              {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {exporting ? "Preparing PDF..." : "Download PDF"}
            </button>
          </div>

          {/* This is the exact region captured into the PDF. Deliberately kept
              light/paper-styled — it's the exportable document itself, not app chrome. */}
          <div ref={docRef} className="overflow-hidden rounded-xl2 border border-white/10 bg-white shadow-card-hover">
            <div className="bg-brand-gradient px-8 py-7">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">SparkDesk Document</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-white">{topic}</h2>
            </div>
            <div className="px-8 py-7">
              <MarkdownLite text={content} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Minimal markdown renderer for headings, bullets, and bold text — styled to
 * look like a designed document (colored headings, custom bullet markers)
 * rather than plain converted text.
 */
function MarkdownLite({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="mb-2 mt-6 font-display text-[19px] font-bold text-brand-700 first:mt-0"
            >
              {trimmed.replace("## ", "")}
            </h2>
          );
        }
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={i} className="mb-1.5 flex items-start gap-2.5 pl-1">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-violet" />
              <p
                className="text-[14.5px] leading-relaxed text-slate-700"
                dangerouslySetInnerHTML={{ __html: boldify(trimmed.slice(2)) }}
              />
            </div>
          );
        }
        if (trimmed === "") return null;
        return (
          <p
            key={i}
            className="mb-2 text-[14.5px] leading-relaxed text-slate-700"
            dangerouslySetInnerHTML={{ __html: boldify(trimmed) }}
          />
        );
      })}
    </div>
  );
}

// Note: this renders inside the white/paper document canvas (docRef), which
// stays light regardless of the app's dark theme — so it uses explicit slate
// colors rather than the ink-* tokens (which are tuned for the dark canvas).
function boldify(s: string) {
  return s.replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-900">$1</strong>');
}
