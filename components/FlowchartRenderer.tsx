"use client";

import { useEffect, useRef, useState, useId } from "react";

export function FlowchartRenderer({ definition }: { definition: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            primaryColor: "#1e1f22",
            primaryTextColor: "#0f1011",
            primaryBorderColor: "#847dff",
            lineColor: "#6a63e0",
            fontFamily: "Inter, sans-serif",
          },
        });
        const { svg } = await mermaid.render(`flowchart-${id}`, definition);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error("[FlowchartRenderer] mermaid render failed:", err);
        if (!cancelled) setError("Couldn't render this flowchart. Try rephrasing the process.");
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [definition, id]);

  if (error) {
    return <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>;
  }

  return <div ref={containerRef} className="flex justify-center overflow-x-auto" />;
}
