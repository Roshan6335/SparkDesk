/**
 * Image generation via Pollinations.ai — a free, keyless image API.
 * Optional POLLINATIONS_API_TOKEN raises the rate limit / removes the
 * watermark if the user adds one later; it works fine with none.
 */

const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt";

export function buildImageUrl(
  prompt: string,
  opts?: { width?: number; height?: number; model?: string; seed?: number }
) {
  const encoded = encodeURIComponent(prompt.trim());
  const params = new URLSearchParams();
  params.set("width", String(opts?.width ?? 1024));
  params.set("height", String(opts?.height ?? 1024));
  params.set("model", opts?.model ?? "flux");
  params.set("nologo", "true");
  if (opts?.seed) params.set("seed", String(opts.seed));

  const token = process.env.POLLINATIONS_API_TOKEN;
  if (token) params.set("token", token);

  return `${POLLINATIONS_BASE}/${encoded}?${params.toString()}`;
}

/**
 * Pollinations generates the image lazily on first request to the URL, so we
 * "warm" it server-side (HEAD-equivalent fetch) to confirm the prompt
 * actually renders before handing the URL back to the client.
 */
export async function generateImage(
  prompt: string,
  opts?: { width?: number; height?: number; model?: string; seed?: number }
): Promise<string> {
  const url = buildImageUrl(prompt, opts);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Pollinations error ${res.status}`);
  }
  return url;
}
