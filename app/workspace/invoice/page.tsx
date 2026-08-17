"use client";

import { useRef, useState } from "react";
import { Receipt, Loader2, Sparkles, Download } from "lucide-react";

type InvoiceItem = { description: string; quantity: number; unitPrice: number };
type InvoiceData = {
  invoiceNumber: string;
  date: string;
  from: string;
  to: string;
  items: InvoiceItem[];
  notes?: string;
};

export default function InvoicePage() {
  const [details, setDetails] = useState("");
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  async function handleGenerate() {
    if (!details.trim() || loading) return;
    setLoading(true);
    setError(null);
    setInvoice(null);
    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ details }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setInvoice(data);
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
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${invoice?.invoiceNumber || "invoice"}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  const total = invoice?.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-brand-gradient-soft text-brand-400">
          <Receipt className="h-4 w-4" />
        </div>
        <div>
          <h1 className="font-display text-xl font-normal text-ink-900">AI Invoice Generator</h1>
          <p className="text-sm text-ink-500">Describe the invoice — get a professional, ready-to-send document.</p>
        </div>
      </div>

      <div className="rounded-xl2 border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl backdrop-saturate-150">
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={5}
          placeholder="e.g. Invoice from Studio Nine to Bright Retail for 40 hours of design work at $60/hr, plus a $200 rush fee"
          className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-500 focus:border-brand-400"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !details.trim()}
          className="mt-4 flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Building..." : "Generate invoice"}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl2 border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {invoice && (
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
          <div ref={docRef} className="overflow-hidden rounded-xl2 border border-white/10 bg-white px-8 py-8 text-slate-800 shadow-card-hover">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-900">Invoice</h2>
                <p className="mt-1 text-sm text-slate-500">{invoice.invoiceNumber}</p>
              </div>
              <p className="text-sm text-slate-500">{invoice.date}</p>
            </div>
            <div className="mb-8 grid grid-cols-2 gap-6">
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">From</p>
                <p className="whitespace-pre-line text-sm text-slate-700">{invoice.from}</p>
              </div>
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">To</p>
                <p className="whitespace-pre-line text-sm text-slate-700">{invoice.to}</p>
              </div>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-2 font-semibold text-slate-600">Description</th>
                  <th className="pb-2 text-right font-semibold text-slate-600">Qty</th>
                  <th className="pb-2 text-right font-semibold text-slate-600">Unit price</th>
                  <th className="pb-2 text-right font-semibold text-slate-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-2.5 text-slate-700">{item.description}</td>
                    <td className="py-2.5 text-right text-slate-700">{item.quantity}</td>
                    <td className="py-2.5 text-right text-slate-700">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 text-right text-slate-700">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <div className="w-48">
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            {invoice.notes && <p className="mt-6 text-xs text-slate-500">{invoice.notes}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
