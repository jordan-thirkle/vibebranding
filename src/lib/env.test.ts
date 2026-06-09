import { describe, it, expect, beforeEach } from "vitest";
import { validateEnv, resetEnvValidation, isStripeConfigured, isGroqConfigured, isSupabaseServiceConfigured } from "./env";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  resetEnvValidation();
  process.env = { ...ORIGINAL_ENV };
});

describe("validateEnv", () => {
  it("passes when all required env vars are set", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
    process.env.GEMINI_API_KEY = "test-gemini-key";
    const errors = validateEnv();
    expect(errors.length).toBe(0);
  });

  it("reports missing required vars", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.GEMINI_API_KEY;
    const errors = validateEnv();
    expect(errors.length).toBeGreaterThanOrEqual(3);
    expect(errors.some((e) => e.includes("NEXT_PUBLIC_SUPABASE_URL"))).toBe(true);
    expect(errors.some((e) => e.includes("GEMINI_API_KEY"))).toBe(true);
  });

  it("does not report optional missing vars as errors", () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.GROQ_API_KEY;
    const errors = validateEnv();
    expect(errors.some((e) => e.includes("STRIPE_SECRET_KEY"))).toBe(false);
    expect(errors.some((e) => e.includes("GROQ_API_KEY"))).toBe(false);
  });

  it("reports placeholder values as errors", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://placeholder.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "placeholder-anon-key";
    process.env.GEMINI_API_KEY = "placeholder";
    const errors = validateEnv();
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe("isStripeConfigured", () => {
  it("returns true when all stripe vars are set", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_real";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_real";
    process.env.STRIPE_PRO_PRICE_ID = "price_pro";
    process.env.STRIPE_UNLIMITED_PRICE_ID = "price_unlimited";
    expect(isStripeConfigured()).toBe(true);
  });

  it("returns false when stripe vars are missing", () => {
    delete process.env.STRIPE_SECRET_KEY;
    expect(isStripeConfigured()).toBe(false);
  });

  it("returns false for placeholder values", () => {
    process.env.STRIPE_SECRET_KEY = "placeholder";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_real";
    process.env.STRIPE_PRO_PRICE_ID = "price_pro";
    process.env.STRIPE_UNLIMITED_PRICE_ID = "price_unlimited";
    expect(isStripeConfigured()).toBe(false);
  });
});

describe("isGroqConfigured", () => {
  it("returns true when GROQ_API_KEY is set", () => {
    process.env.GROQ_API_KEY = "gsk_real_key";
    expect(isGroqConfigured()).toBe(true);
  });

  it("returns false when GROQ_API_KEY is missing", () => {
    delete process.env.GROQ_API_KEY;
    expect(isGroqConfigured()).toBe(false);
  });
});

describe("isSupabaseServiceConfigured", () => {
  it("returns true when SUPABASE_SERVICE_ROLE_KEY is set", () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real";
    expect(isSupabaseServiceConfigured()).toBe(true);
  });

  it("returns false when key is missing", () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(isSupabaseServiceConfigured()).toBe(false);
  });
});
