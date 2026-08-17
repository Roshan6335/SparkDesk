"use client";

import { useRef, useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { MarkdownLite } from "@/components/MarkdownLite";

export function DocumentCard({ topic, content }: { topic: string; content: string }) {
  const docRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

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
    <div className="max-w-[85%] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2 text-ink-700">
          <FileText className="h-4 w-4 text-brand-400" />
          <span className="text-xs font-medium uppercase tracking-wide text-ink-300">Document</span>
        </div>
        <button
          onClick={handleDownloadPdf}
          disabled={exporting}
          className="flex items-center gap-1.5 rounded-full border border-brand-400/40 bg-brand-500/15 px-3 py-1.5 text-[11px] font-semibold text-brand-300 transition-colors hover:bg-brand-500/25 disabled:opacity-40"
        >
          {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
          {exporting ? "Preparing..." : "Download PDF"}
        </button>
      </div>

      {/* Captured region for the PDF export — deliberately kept light/paper-styled. */}
      <div ref={docRef} className="max-h-80 overflow-y-auto bg-white px-6 py-5">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">SparkDesk Document</p>
        <h3 className="mb-3 font-display text-lg font-bold text-slate-900">{topic}</h3>
        <MarkdownLite text={content} />
      </div>
    </div>
  );
}
