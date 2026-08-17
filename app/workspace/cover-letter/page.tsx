"use client";

import { useRef, useState } from "react";
import { Mail, Loader2, Sparkles, Download } from "lucide-react";
import { MarkdownLite } from "@/components/MarkdownLite";

export default function CoverLetterPage() {
  const [resume, setResume] = useState("");
  const [jobPost, setJobPost] = useState("");
  const [letter, setLetter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  async function handleGenerate() {
    if (!resume.trim() || !jobPost.trim() || loading) return;
    setLoading(true);
    setError(null);
    setLetter(null);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobPost }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setLetter(data.letter);
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
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([import("jspdf"), import("html2canvas")]);
      const canvas = await html2canvas(docRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
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
      pdf.save("cover-letter.pdf");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-brand-gradient-soft text-brand-400">
          <Mail className="h-4 w-4" />
        </div>
        <div>
          <h1 className="font-display text-xl font-normal text-ink-900">AI Cover Letter Generator</h1>
          <p className="text-sm text-ink-500">Tailored cover letters from your background and a job post.</p>
        </div>
      </div>

      <div className="rounded-xl2 border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl backdrop-saturate-150">
        <label className="mb-2 block text-sm font-medium text-ink-700">Your background</label>
        <textarea
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          rows={5}
          placeholder="Paste your resume, or summarize your experience..."
          className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-500 focus:border-brand-400"
        />
        <label className="mb-2 mt-4 block text-sm font-medium text-ink-700">Job posting</label>
        <textarea
          value={jobPost}
          onChange={(e) => setJobPost(e.target.value)}
          rows={5}
          placeholder="Paste the job description..."
          className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-500 focus:border-brand-400"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !resume.trim() || !jobPost.trim()}
          className="mt-4 flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Writing..." : "Generate cover letter"}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl2 border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {letter && (
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
          <div ref={docRef} className="overflow-hidden rounded-xl2 border border-white/10 bg-white px-8 py-7 shadow-card-hover">
            <MarkdownLite text={letter} />
          </div>
        </div>
      )}
    </div>
  );
}
