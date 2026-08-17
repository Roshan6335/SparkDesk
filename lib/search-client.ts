/**
 * Web search for grounding the Fact Checker tool.
 *
 * - Primary: Tavily (built for LLM-facing search, returns clean snippets)
 * - Fallback: Serper.dev (Google results) if Tavily fails, rate-limits, or its
 *   key is missing
 *
 * Same fallback shape as lib/ai-client.ts — if either provider's free tier
 * runs out or errors, the other one quietly takes over. The user never sees
 * a broken fact-checker just because one provider had a bad day.
 */

export type SearchResult = { title: string; url: string; snippet: string };

async function searchTavily(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY missing");

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: 5,
      include_answer: false,
    }),
  });

  if (!res.ok) throw new Error(`Tavily error ${res.status}`);

  const data = await res.json();
  const results = (data?.results ?? []) as Array<{ title: string; url: string; content: string }>;
  return results.map((r) => ({ title: r.title, url: r.url, snippet: r.content }));
}

async function searchSerper(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) throw new Error("SERPER_API_KEY missing");

  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num: 5 }),
  });

  if (!res.ok) throw new Error(`Serper error ${res.status}`);

  const data = await res.json();
  const results = (data?.organic ?? []) as Array<{ title: string; link: string; snippet: string }>;
  return results.map((r) => ({ title: r.title, url: r.link, snippet: r.snippet }));
}

export async function webSearch(query: string): Promise<SearchResult[]> {
  try {
    return await searchTavily(query);
  } catch (tavilyErr) {
    console.error("[search-client] Tavily failed, falling back to Serper:", tavilyErr);
    try {
      return await searchSerper(query);
    } catch (serperErr) {
      console.error("[search-client] Serper fallback also failed:", serperErr);
      throw new Error("Both search providers failed. Please try again in a moment.");
    }
  }
}
