/**
 * Lightweight in-memory rate limiter for API routes.
 *
 * Uses a sliding window approach with a Map. NOT shared across
 * Vercel serverless instances — sufficient for Hobby plan.
 * For production scale, swap with Upstash Redis.
 */

export interface RateLimitConfig {
  windowMs: number;   // time window in ms
  maxRequests: number; // max requests per window
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // epoch ms
}

const stores = new Map<string, Map<string, { count: number; resetAt: number }>>();

/**
 * Check if a request is within rate limits for the given key.
 *
 * @param key - unique identifier (e.g. user IP, user ID, or API key)
 * @param config - rate limit configuration
 * @returns whether the request is allowed and remaining budget
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { windowMs: 60_000, maxRequests: 30 }
): RateLimitResult {
  const now = Date.now();

  let store = stores.get(key);
  if (!store || store.has(key) && (store.get(key)?.resetAt ?? 0) < now) {
    store = new Map();
    stores.set(key, store);
  }

  const record = store.get(key);
  if (!record || record.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (record.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: config.maxRequests - record.count, resetAt: record.resetAt };
}

/**
 * Clean up stale entries from the rate limit store (call periodically).
 */
export function cleanRateLimitStores(): void {
  const now = Date.now();
  for (const [key, store] of stores.entries()) {
    for (const [subKey, record] of store.entries()) {
      if (record.resetAt < now) {
        store.delete(subKey);
      }
    }
    if (store.size === 0) {
      stores.delete(key);
    }
  }
}
