/**
 * Shared server-side AI client for SparkDesk.
 *
 * - Primary provider: Groq (fast + cheap)
 * - Fallback provider: OpenRouter (if Groq fails or rate-limits)
 * - Retry with exponential backoff on transient failures
 * - Never called from the client — only import this inside app/api/** route handlers
 */

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type CallOptions = {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean; // if true, we ask the model for strict JSON and repair it on parse failure
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Default models — override via env if you want to swap without a redeploy
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGroq(opts: CallOptions): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY missing");

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 2000,
      ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq error ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned empty content");
  return content;
}

async function callOpenRouter(opts: CallOptions): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing");

  const res = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://sparkdesk.vercel.app",
      "X-Title": "SparkDesk",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 2000,
      ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenRouter error ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned empty content");
  return content;
}

/**
 * Retries a single provider call up to `retries` times with exponential backoff.
 * Only retries on transient-looking failures (network / 429 / 5xx already surfaced as thrown errors here).
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 2, baseDelayMs = 500): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await sleep(baseDelayMs * Math.pow(2, attempt));
      }
    }
  }
  throw lastErr;
}

/**
 * Main entry point: tries Groq first (with retries), falls back to OpenRouter (with retries) on total failure.
 */
export async function generateCompletion(opts: CallOptions): Promise<string> {
  try {
    return await withRetry(() => callGroq(opts));
  } catch (groqErr) {
    console.error("[ai-client] Groq failed, falling back to OpenRouter:", groqErr);
    try {
      return await withRetry(() => callOpenRouter(opts));
    } catch (orErr) {
      console.error("[ai-client] OpenRouter fallback also failed:", orErr);
      throw new Error("Both AI providers failed. Please try again in a moment.");
    }
  }
}

/**
 * Attempts to parse JSON from a model response. If parsing fails outright
 * (model wrapped it in markdown fences, added a preamble, etc.), this repairs
 * common issues before giving up.
 */
export function repairAndParseJSON<T = unknown>(raw: string): T {
  let text = raw.trim();

  // Strip markdown code fences if present
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");

  // Try direct parse first
  try {
    return JSON.parse(text) as T;
  } catch {
    // fall through to repair attempts
  }

  // Extract the first {...} or [...] block, in case there's preamble/postamble text
  const objMatch = text.match(/\{[\s\S]*\}/);
  const arrMatch = text.match(/\[[\s\S]*\]/);
  const candidate = objMatch?.[0] ?? arrMatch?.[0];

  if (candidate) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // Common issue: trailing commas
      const noTrailingCommas = candidate.replace(/,(\s*[}\]])/g, "$1");
      try {
        return JSON.parse(noTrailingCommas) as T;
      } catch (finalErr) {
        throw new Error(`Failed to repair JSON from model output: ${(finalErr as Error).message}`);
      }
    }
  }

  throw new Error("Model output did not contain parseable JSON");
}
