import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { PromptBar } from "@/components/PromptBar";
import { ToolTile } from "@/components/ToolTile";
import { CategoryCard } from "@/components/CategoryCard";
import { Reveal } from "@/components/Reveal";
import {
  TOOLS,
  CATEGORIES,
  CATEGORY_META,
  getCategoryColor,
  getCategoryToolCount,
  getLiveTools,
} from "@/lib/tools";

export default function HomePage() {
  const liveTools = getLiveTools();

  return (
    <main className="min-h-screen bg-surface">
      <NavBar />

      {/* ---------- HERO — atmospheric sky, drifting clouds ---------- */}
      <section className="relative overflow-hidden bg-sky-atmosphere px-6 pb-0 pt-28 text-center sm:pt-36">
        <div className="cloud-layer" aria-hidden="true">
          <div className="cloud cloud-1" />
          <div className="cloud cloud-2" />
          <div className="cloud cloud-3" />
          <div className="cloud cloud-4" />
          <div className="cloud cloud-5" />
        </div>

        {/* fade into the dark canvas below */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-40"
          style={{ background: "linear-gradient(180deg, rgba(15,16,17,0) 0%, #0f1011 100%)" }}
        />

        <div className="relative z-[3] mx-auto max-w-2xl pb-24">
          <h1
            className="animate-fade-up font-display text-[44px] font-normal italic leading-[0.95] tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.25)] sm:text-[64px]"
            style={{ animationDelay: "0.05s" }}
          >
            Ask anything.
          </h1>

          <div className="mx-auto mt-6 max-w-md animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <p className="text-[17px] font-semibold text-white">SparkDesk is your all-in-one AI workspace.</p>
            <p className="mt-1.5 text-[16px] font-light leading-relaxed text-white/80">
              Chat, write, and design — generated in one place, no tab-switching required.
            </p>
          </div>

          <div className="mt-9 animate-fade-up" style={{ animationDelay: "0.35s" }}>
            <PromptBar />
          </div>

          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 animate-fade-up"
            style={{ animationDelay: "0.5s" }}
          >
            {liveTools.map((tool) => (
              <div key={tool.slug} className="flex flex-col items-center gap-1">
                <span className="font-display text-[15px] font-normal text-white/90">{tool.name}</span>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/50">Live now</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Feature category cards ---------- */}
      <section id="tools" className="relative z-[3] px-6 pb-8 pt-4">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="mb-10 text-center">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-300">Workspace</div>
              <h2 className="mt-4 font-display text-[34px] font-normal leading-none tracking-tight text-ink-900 sm:text-[38px]">
                Every tool, one desk.
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((category, i) => {
              const meta = CATEGORY_META[category];
              const { fg } = getCategoryColor(category);
              return (
                <Reveal key={category} delay={i * 90}>
                  <CategoryCard
                    category={category}
                    description={meta?.description ?? ""}
                    icon={meta?.icon ?? "Sparkles"}
                    accent={fg}
                    count={getCategoryToolCount(category)}
                  />
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Full tool catalog ---------- */}
      <section className="px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          {CATEGORIES.map((category) => {
            const toolsInCategory = TOOLS.filter((t) => t.category === category);
            return (
              <Reveal key={category} className="mb-9 border-b border-white/[0.08] pb-9 last:border-0">
                <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-ink-300">{category}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-5">
                  {toolsInCategory.map((tool) => (
                    <ToolTile key={tool.slug} tool={tool} />
                  ))}
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------- Process ---------- */}
      <section className="border-t border-white/[0.08] bg-surface-soft/40 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="mb-14 text-center">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-300">Process</div>
              <h2 className="mt-4 font-display text-[34px] font-normal leading-none tracking-tight text-ink-900 sm:text-[38px]">
                From prompt to finished file.
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                num: "01",
                label: "Ask",
                title: "Type what you need",
                body: "Open any tool, describe the outcome in plain language — no setup, no template to pick first.",
              },
              {
                num: "02",
                label: "Generate",
                title: "SparkDesk builds a first draft",
                body: "Your request is generated in seconds, formatted and ready to review — not a wall of raw text.",
              },
              {
                num: "03",
                label: "Export",
                title: "Take it with you",
                body: "Download as PPTX, PDF, or plain text — the work is yours the moment it's generated.",
              },
            ].map((step, i) => (
              <Reveal key={step.num} delay={i * 120}>
                <div className="border-t border-white/[0.12] pt-6">
                  <div className="mb-4 font-mono text-[12px] tracking-[0.1em] text-accent-cyan">
                    {step.num} — {step.label.toUpperCase()}
                  </div>
                  <h4 className="mb-2.5 text-[18px] font-medium text-ink-900">{step.title}</h4>
                  <p className="text-[15px] leading-relaxed text-ink-500">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="px-6 py-24 text-center">
        <Reveal>
          <h2 className="mx-auto max-w-lg font-display text-[36px] font-normal italic leading-[0.98] tracking-tight text-ink-900 sm:text-[42px]">
            Your desk is waiting.
          </h2>
          <Link
            href="/workspace"
            className="mt-9 inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-black shadow-card transition-transform hover:-translate-y-0.5"
          >
            Open full workspace
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Reveal>
      </section>

      <footer className="border-t border-white/[0.08] py-10 text-center">
        <div className="font-display text-[16px] font-normal text-ink-900">SparkDesk</div>
        <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-300">
          © {new Date().getFullYear()} SparkDesk — All-in-One AI Workspace
        </p>
      </footer>
    </main>
  );
}
