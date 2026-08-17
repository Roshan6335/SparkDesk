"use client";

import { useState } from "react";
import { LayoutDashboard, Loader2, Sparkles } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ChartSpec = { type: "bar" | "line" | "pie"; title: string; data: { label: string; value: number }[] };
type DashboardData = { title: string; charts: ChartSpec[] };

const PIE_COLORS = ["#847dff", "#dd90d8", "#90b8f0", "#00b3dd", "#a390ff", "#4b49aa"];

export default function DashboardPage() {
  const [prompt, setPrompt] = useState("");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setDashboard(null);
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setDashboard(data);
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
          <LayoutDashboard className="h-4 w-4" />
        </div>
        <div>
          <h1 className="font-display text-xl font-normal text-ink-900">AI Dashboards</h1>
          <p className="text-sm text-ink-500">Ask a question in plain English — get a live dashboard.</p>
        </div>
      </div>

      <div className="rounded-xl2 border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl backdrop-saturate-150">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="e.g. Quarterly revenue by region for a mid-size SaaS company"
          className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-500 focus:border-brand-400"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="mt-4 flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Building..." : "Generate dashboard"}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl2 border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {dashboard && (
        <div className="mt-6">
          <h2 className="mb-4 font-display text-lg font-normal text-ink-900">{dashboard.title}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {dashboard.charts.map((chart, i) => (
              <div
                key={i}
                className="rounded-xl2 border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl backdrop-saturate-150"
              >
                <h3 className="mb-3 text-sm font-semibold text-ink-900">{chart.title}</h3>
                <ResponsiveContainer width="100%" height={220}>
                  {chart.type === "bar" ? (
                    <BarChart data={chart.data}>
                      <XAxis dataKey="label" tick={{ fill: "#9f9fa0", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
                      <YAxis tick={{ fill: "#9f9fa0", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#151617", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f5f5f7" }} />
                      <Bar dataKey="value" fill="#847dff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : chart.type === "line" ? (
                    <LineChart data={chart.data}>
                      <XAxis dataKey="label" tick={{ fill: "#9f9fa0", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
                      <YAxis tick={{ fill: "#9f9fa0", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#151617", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f5f5f7" }} />
                      <Line type="monotone" dataKey="value" stroke="#90b8f0" strokeWidth={2} dot={{ fill: "#90b8f0" }} />
                    </LineChart>
                  ) : (
                    <PieChart>
                      <Pie data={chart.data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80}>
                        {chart.data.map((_, ci) => (
                          <Cell key={ci} fill={PIE_COLORS[ci % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#151617", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f5f5f7" }} />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
