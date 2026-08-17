import { ToolIcon } from "./ToolIcon";

export function CategoryCard({
  category,
  description,
  icon,
  accent,
  count,
}: {
  category: string;
  description: string;
  icon: string;
  accent: string;
  count: number;
}) {
  return (
    <div className="group relative flex h-full flex-col rounded-3xl2 border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ease-smooth hover:-translate-y-1.5 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-glow">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 transition-transform duration-300 ease-smooth group-hover:scale-110"
        style={{ backgroundColor: `${accent}22` }}
      >
        <ToolIcon name={icon} className="h-5 w-5" style={{ color: accent }} />
      </div>

      <h3 className="mt-7 font-display text-[26px] font-normal leading-[0.98] tracking-tight text-ink-900">
        {category}
      </h3>
      <p className="mt-3 text-[14.5px] leading-relaxed text-ink-500">{description}</p>

      <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300">
        {count} {count === 1 ? "tool" : "tools"}
      </div>
    </div>
  );
}
