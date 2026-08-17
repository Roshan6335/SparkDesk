"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { DocumentCard } from "@/components/chat/DocumentCard";
import { PresentationCard } from "@/components/chat/PresentationCard";

type Slide = { title: string; bullets: string[]; speakerNotes: string };
type Deck = { title: string; slides: Slide[] };

type Message =
  | { role: "user"; type: "text"; content: string }
  | { role: "assistant"; type: "text"; content: string }
  | { role: "assistant"; type: "document"; intro: string; topic: string; content: string }
  | { role: "assistant"; type: "presentation"; intro: string; deck: Deck };

const HISTORY_KEY = "sparkdesk_chat_history_v1";

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageInner />
    </Suspense>
  );
}

function ChatPageInner() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const autoSentRef = useRef(false);
  const hydratedRef = useRef(false);

  // Load saved history once on mount (guest-mode persistence via localStorage).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore corrupt storage
    } finally {
      hydratedRef.current = true;
    }
  }, []);

  // Persist history after every change (skip the very first render before hydration).
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
    } catch {
      // storage full or unavailable — non-fatal
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // If arriving from the homepage prompt bar with ?q=..., send it automatically once.
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !autoSentRef.current) {
      autoSentRef.current = true;
      sendMessage(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Converts the rich message list into the plain {role, content} shape the
  // API expects — document/presentation turns are summarized so the model
  // still has conversational context without re-sending huge payloads.
  function toApiHistory(list: Message[]) {
    return list.map((m) => {
      if (m.type === "text") return { role: m.role, content: m.content };
      if (m.type === "document") {
        return { role: "assistant" as const, content: `${m.intro} (Generated a document titled "${m.topic}".)` };
      }
      return {
        role: "assistant" as const,
        content: `${m.intro} (Generated a ${m.deck.slides.length}-slide presentation titled "${m.deck.title}".)`,
      };
    });
  }

  async function sendMessage(text: string) {
    const trimmedText = text.trim();
    if (!trimmedText || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", type: "text", content: trimmedText }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toApiHistory(nextMessages) }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      if (data.type === "document") {
        setMessages([
          ...nextMessages,
          { role: "assistant", type: "document", intro: data.intro, topic: data.topic, content: data.content },
        ]);
      } else if (data.type === "presentation") {
        setMessages([...nextMessages, { role: "assistant", type: "presentation", intro: data.intro, deck: data.deck }]);
      } else {
        setMessages([...nextMessages, { role: "assistant", type: "text", content: data.content }]);
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    sendMessage(input);
  }

  return (
    <div className="flex h-screen flex-col bg-surface">
      <div className="border-b border-white/[0.08] bg-white/[0.02] px-8 py-5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-brand-gradient-soft text-brand-400">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h1 className="font-display text-base font-normal text-ink-900">AI Chat</h1>
            <p className="text-xs text-ink-500">Ask anything — or ask it to build a document or presentation for you.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {messages.length === 0 && (
          <div className="mx-auto mt-16 max-w-md text-center text-ink-300">
            <MessageSquare className="mx-auto mb-3 h-8 w-8" />
            <p className="text-sm">Start a conversation below — try &ldquo;make me a presentation on climate change&rdquo;.</p>
          </div>
        )}

        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.map((m, i) => {
            if (m.type === "document") {
              return (
                <div key={i} className="flex flex-col gap-2">
                  {m.intro && (
                    <div className="mr-auto max-w-[85%] rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-ink-700 backdrop-blur-xl">
                      {m.intro}
                    </div>
                  )}
                  <DocumentCard topic={m.topic} content={m.content} />
                </div>
              );
            }
            if (m.type === "presentation") {
              return (
                <div key={i} className="flex flex-col gap-2">
                  {m.intro && (
                    <div className="mr-auto max-w-[85%] rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-ink-700 backdrop-blur-xl">
                      {m.intro}
                    </div>
                  )}
                  <PresentationCard deck={m.deck} />
                </div>
              );
            }
            return (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-brand-gradient text-white shadow-card"
                    : "mr-auto border border-white/10 bg-white/[0.04] text-ink-700 backdrop-blur-xl"
                }`}
              >
                {m.content}
              </div>
            );
          })}
          {loading && (
            <div className="mr-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-ink-500 backdrop-blur-xl">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </div>
          )}
          {error && (
            <div className="mr-auto rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-white/[0.08] bg-white/[0.02] px-8 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Message SparkDesk..."
            className="flex-1 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-500 focus:border-brand-400"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white transition-transform hover:-translate-y-0.5 disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
