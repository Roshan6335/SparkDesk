/**
 * Simple in-memory per-IP rate limiter.
 *
 * NOTE: this resets whenever the serverless function cold-starts, and is NOT
 * shared across multiple Vercel instances. It's fine for early-stage traffic.
 * When you outgrow it, swap this for Upstash Redis (same pattern you used
 * in KeryoAI) — the checkRateLimit() call site below won't need to change.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 10;

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetInMs: WINDOW_MS };
  }

  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetInMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - bucket.count, resetInMs: bucket.resetAt - now };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
