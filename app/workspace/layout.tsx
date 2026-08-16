import Link from "next/link";
import { Sparkles, LayoutGrid } from "lucide-react";
import { ToolIcon } from "@/components/ToolIcon";
import { getLiveTools } from "@/lib/tools";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const liveTools = getLiveTools();

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.08] bg-white/[0.02] backdrop-blur-xl backdrop-saturate-150 md:flex">
        <Link href="/" className="flex items-center gap-2 border-b border-white/[0.08] px-6 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/10">
            <Sparkles className="h-4 w-4 text-brand-400" />
          </div>
          <span className="font-display text-[16px] font-normal text-ink-900">SparkDesk</span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <Link
            href="/workspace"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-white/[0.06]"
          >
            <LayoutGrid className="h-4 w-4" />
            All tools
          </Link>

          <div className="mt-4 mb-1 px-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-300">
            Live tools
          </div>
          {liveTools.map((tool) => (
            <Link
              key={tool.slug}
              href={tool.href!}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-white/[0.06]"
            >
              <ToolIcon name={tool.icon} className="h-4 w-4 text-brand-400" />
              {tool.name}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/[0.08] px-4 py-4 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-300">
          More tools ship every week.
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
