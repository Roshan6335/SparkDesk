import Link from "next/link";
import { Sparkles, LayoutGrid } from "lucide-react";
import { ToolIcon } from "@/components/ToolIcon";
import { getLiveTools } from "@/lib/tools";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const liveTools = getLiveTools();

  return (
    <div className="flex min-h-screen bg-surface-soft">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-surface-border bg-white md:flex">
        <Link href="/" className="flex items-center gap-2 border-b border-surface-border px-6 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display text-[16px] font-bold text-ink-900">SparkDesk</span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <Link
            href="/workspace"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-surface-soft"
          >
            <LayoutGrid className="h-4 w-4" />
            All tools
          </Link>

          <div className="mt-4 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-ink-300">
            Live tools
          </div>
          {liveTools.map((tool) => (
            <Link
              key={tool.slug}
              href={tool.href!}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-surface-soft"
            >
              <ToolIcon name={tool.icon} className="h-4 w-4 text-brand-600" />
              {tool.name}
            </Link>
          ))}
        </nav>

        <div className="border-t border-surface-border px-4 py-4 text-xs text-ink-300">
          More tools ship every week.
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
