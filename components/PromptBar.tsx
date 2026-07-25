"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Plus } from "lucide-react";

export function PromptBar() {
  const [value, setValue] = useState("");
  const router = useRouter();

  function handleSubmit() {
    const text = value.trim();
    if (!text) return;
    router.push(`/workspace/chat?q=${encodeURIComponent(text)}`);
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-surface-border bg-white p-3 shadow-card-hover">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        rows={2}
        placeholder="Ask anything, create anything..."
        className="w-full resize-none px-2 py-1 text-[15px] text-ink-900 outline-none placeholder:text-ink-300"
      />
      <div className="flex items-center justify-between px-1 pt-1">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-surface-border text-ink-500 hover:bg-surface-soft"
          aria-label="Add attachment (coming soon)"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-white disabled:opacity-30"
          aria-label="Submit"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
