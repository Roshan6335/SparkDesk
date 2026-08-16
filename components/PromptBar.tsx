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
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/15 bg-white/[0.06] p-3 shadow-card backdrop-blur-xl backdrop-saturate-150 transition-colors focus-within:border-white/25 focus-within:bg-white/[0.09]">
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
        className="w-full resize-none bg-transparent px-2 py-1 text-[15px] text-ink-900 outline-none placeholder:text-ink-500"
      />
      <div className="flex items-center justify-between px-1 pt-1">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-ink-500 transition-colors hover:bg-white/10"
          aria-label="Add attachment (coming soon)"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition-transform hover:-translate-y-0.5 disabled:opacity-30"
          aria-label="Submit"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
