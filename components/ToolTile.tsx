import Link from "next/link";
import { ToolIcon } from "./ToolIcon";
import { getCategoryColor, type Tool } from "@/lib/tools";

export function ToolTile({ tool }: { tool: Tool }) {
  const { bg, fg } = getCategoryColor(tool.color);

  const inner = (
    <div className="flex w-[92px] flex-col items-center gap-2 text-center">
      <div className="relative">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 backdrop-blur-sm transition-all duration-300 ease-smooth ${
            tool.status === "live" ? "group-hover:-translate-y-1 group-hover:scale-105 group-hover:border-white/25" : ""
          }`}
          style={{ backgroundColor: bg }}
        >
          <ToolIcon name={tool.icon} className="h-5 w-5" style={{ color: fg }} />
        </div>
        {tool.status === "soon" && (
          <span className="absolute -right-1.5 -top-1.5 rounded-full border border-white/15 bg-surface px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase leading-none tracking-wide text-ink-300">
            Soon
          </span>
        )}
      </div>
      <span className="text-[12.5px] font-medium leading-tight text-ink-700">{tool.name}</span>
    </div>
  );

  if (tool.status === "live" && tool.href) {
    return (
      <Link href={tool.href} className="group">
        {inner}
      </Link>
    );
  }

  return <div className="cursor-default opacity-80">{inner}</div>;
}
