import { PromptBar } from "@/components/PromptBar";
import { ToolTile } from "@/components/ToolTile";
import { TOOLS, CATEGORIES } from "@/lib/tools";

export default function WorkspacePage() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      <div className="mb-8 text-center">
        <h1 className="font-display text-xl font-bold text-ink-900">Ask anything, create anything</h1>
        <div className="mt-5">
          <PromptBar />
        </div>
      </div>

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
    </div>
  );
}
