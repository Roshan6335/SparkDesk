import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { PromptBar } from "@/components/PromptBar";
import { ToolTile } from "@/components/ToolTile";
import { TOOLS, CATEGORIES } from "@/lib/tools";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <NavBar />

      {/* Hero — lean and prompt-first, like Genspark's workspace entry point */}
      <section className="px-6 pb-12 pt-16 text-center">
        <h1 className="font-display text-[28px] font-bold text-ink-900 sm:text-[34px]">
          SparkDesk <span className="text-ink-300">— Your All-in-One AI Workspace</span>
        </h1>
        <div className="mt-8">
          <PromptBar />
        </div>
      </section>

      {/* Tool rows grouped by category — scannable at a glance, no guesswork */}
      <section id="tools" className="mx-auto max-w-5xl px-6 pb-20">
        {CATEGORIES.map((category) => {
          const toolsInCategory = TOOLS.filter((t) => t.category === category);
          return (
            <div key={category} className="mb-9 border-b border-surface-border pb-9 last:border-0">
              <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-ink-300">
                {category}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-5">
                {toolsInCategory.map((tool) => (
                  <ToolTile key={tool.slug} tool={tool} />
                ))}
              </div>
            </div>
          );
        })}

        <div className="mt-4 text-center">
          <Link
            href="/workspace"
            className="inline-block rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
          >
            Open full workspace
          </Link>
        </div>
      </section>

      <footer className="border-t border-surface-border py-8 text-center text-xs text-ink-300">
        © {new Date().getFullYear()} SparkDesk. All rights reserved.
      </footer>
    </main>
  );
}
