import { describe, it, expect } from "vitest";
import { checkRateLimit, cleanRateLimitStores } from "./rate-limit";

describe("checkRateLimit", () => {
  it("allows first request", () => {
    const result = checkRateLimit("test-key", { windowMs: 60_000, maxRequests: 5 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });

  it("decrements remaining on subsequent requests", () => {
    const key = `test-remaining-${Date.now()}`;
    const r1 = checkRateLimit(key, { windowMs: 60_000, maxRequests: 3 });
    expect(r1.remaining).toBe(2);
    const r2 = checkRateLimit(key, { windowMs: 60_000, maxRequests: 3 });
    expect(r2.remaining).toBe(1);
    const r3 = checkRateLimit(key, { windowMs: 60_000, maxRequests: 3 });
    expect(r3.remaining).toBe(0);
  });

  it("blocks requests over the limit", () => {
    const key = `test-block-${Date.now()}`;
    const config = { windowMs: 60_000, maxRequests: 2 };
    checkRateLimit(key, config);
    checkRateLimit(key, config);
    const result = checkRateLimit(key, config);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    const key = `test-reset-${Date.now()}`;
    const config = { windowMs: 50, maxRequests: 1 }; // 50ms window
    checkRateLimit(key, config);
    // Blocked immediately
    expect(checkRateLimit(key, config).allowed).toBe(false);
    // Wait for window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const result = checkRateLimit(key, config);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(0); // maxRequests - 1 after this request
        resolve();
      }, 60);
    });
  });

  it("uses separate stores for different keys", () => {
    const key1 = `test-separate-1-${Date.now()}`;
    const key2 = `test-separate-2-${Date.now()}`;
    const config = { windowMs: 60_000, maxRequests: 1 };
    checkRateLimit(key1, config);
    expect(checkRateLimit(key1, config).allowed).toBe(false);
    expect(checkRateLimit(key2, config).allowed).toBe(true); // different key unaffected
  });
});

describe("cleanRateLimitStores", () => {
  it("cleans up expired entries without throwing", () => {
    const key = `test-clean-${Date.now()}`;
    checkRateLimit(key, { windowMs: 1, maxRequests: 1 });
    // Small wait then clean
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(() => cleanRateLimitStores()).not.toThrow();
        resolve();
      }, 10);
    });
  });
});
