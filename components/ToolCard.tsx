import Link from "next/link";
import { ToolIcon } from "./ToolIcon";
import type { Tool } from "@/lib/tools";

export function ToolCard({ tool }: { tool: Tool }) {
  const inner = (
    <div
      className={`group relative flex h-full flex-col gap-3 rounded-xl2 border border-surface-border bg-white p-5 shadow-card transition-all ${
        tool.status === "live"
          ? "hover:-translate-y-0.5 hover:shadow-card-hover hover:border-brand-300 cursor-pointer"
          : "opacity-70"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gradient-soft text-brand-600">
          <ToolIcon name={tool.icon} className="h-5 w-5" />
        </div>
        {tool.status === "soon" && (
          <span className="rounded-full bg-surface-soft px-2.5 py-1 text-[11px] font-medium text-ink-500">
            Coming soon
          </span>
        )}
      </div>
      <div>
        <h3 className="font-display text-[15px] font-semibold text-ink-900">{tool.name}</h3>
        <p className="mt-1 text-[13px] leading-snug text-ink-500">{tool.description}</p>
      </div>
    </div>
  );

  if (tool.status === "live" && tool.href) {
    return (
      <Link href={tool.href} className="block h-full">
        {inner}
      </Link>
    );
  }

  return <div className="h-full">{inner}</div>;
}
