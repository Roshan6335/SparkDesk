import { ToolCard } from "@/components/ToolCard";
import { TOOLS, CATEGORIES } from "@/lib/tools";

export default function WorkspacePage() {
  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink-900">Your workspace</h1>
        <p className="mt-1 text-sm text-ink-500">
          Pick a tool to get started. Cards marked "Coming soon" are on the roadmap.
        </p>
      </div>

      {CATEGORIES.map((category) => {
        const toolsInCategory = TOOLS.filter((t) => t.category === category);
        return (
          <div key={category} className="mb-10">
            <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-ink-500">
              {category}
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {toolsInCategory.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
