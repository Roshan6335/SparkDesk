import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { ToolCard } from "@/components/ToolCard";
import { TOOLS } from "@/lib/tools";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-gradient-soft">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <span className="mb-5 inline-block rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-brand-600 shadow-card">
            All-in-one AI workspace
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight text-ink-900 sm:text-5xl">
            One workspace for every
            <br />
            <span className="bg-brand-gradient bg-clip-text text-transparent">AI-powered task</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-ink-500 sm:text-lg">
            Chat, draft documents, and outline presentations — all from one clean workspace.
            More tools shipping every week.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/workspace"
              className="flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
            >
              Open Workspace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Tools preview grid */}
      <section id="tools" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
            Everything in one place
          </h2>
          <p className="mt-2 text-ink-500">Live tools work now. The rest are on the way.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      {/* About / footer strip */}
      <section id="about" className="border-t border-surface-border bg-surface-soft">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h2 className="font-display text-xl font-bold text-ink-900">Built to grow, one tool at a time</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-ink-500">
            SparkDesk ships new AI tools incrementally. Every "Coming soon" card on this
            page is on the roadmap — check back often.
          </p>
        </div>
      </section>

      <footer className="border-t border-surface-border py-8 text-center text-xs text-ink-300">
        © {new Date().getFullYear()} SparkDesk. All rights reserved.
      </footer>
    </main>
  );
}
