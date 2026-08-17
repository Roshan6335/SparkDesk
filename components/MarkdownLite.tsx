// Renders inside a white/paper document canvas (kept light regardless of the
// app's dark theme) — so it uses explicit slate colors rather than the ink-*
// tokens, which are tuned for the dark canvas.
export function MarkdownLite({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={i} className="mb-2 mt-6 font-display text-[19px] font-bold text-brand-700 first:mt-0">
              {trimmed.replace("## ", "")}
            </h2>
          );
        }
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={i} className="mb-1.5 flex items-start gap-2.5 pl-1">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-violet" />
              <p
                className="text-[14.5px] leading-relaxed text-slate-700"
                dangerouslySetInnerHTML={{ __html: boldify(trimmed.slice(2)) }}
              />
            </div>
          );
        }
        if (trimmed === "") return null;
        return (
          <p
            key={i}
            className="mb-2 text-[14.5px] leading-relaxed text-slate-700"
            dangerouslySetInnerHTML={{ __html: boldify(trimmed) }}
          />
        );
      })}
    </div>
  );
}

function boldify(s: string) {
  return s.replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-900">$1</strong>');
}
