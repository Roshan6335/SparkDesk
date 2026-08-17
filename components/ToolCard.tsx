import Link from "next/link";
import { ToolIcon } from "./ToolIcon";
import { getCategoryColor, type Tool } from "@/lib/tools";

export function ToolCard({ tool }: { tool: Tool }) {
  const { bg, fg } = getCategoryColor(tool.color);

  const inner = (
    <div
      className={`group relative flex h-full flex-col gap-3 rounded-xl2 border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ease-smooth ${
        tool.status === "live"
          ? "cursor-pointer hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-glow"
          : "opacity-70"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10"
          style={{ backgroundColor: bg }}
        >
          <ToolIcon name={tool.icon} className="h-5 w-5" style={{ color: fg }} />
        </div>
        {tool.status === "soon" && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wide text-ink-300">
            Coming soon
          </span>
        )}
      </div>
      <div>
        <h3 className="font-display text-[17px] font-normal text-ink-900">{tool.name}</h3>
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
