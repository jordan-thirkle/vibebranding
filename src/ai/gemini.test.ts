import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateWithGemini } from "./gemini";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", mockFetch);
});

describe("generateWithGemini", () => {
  it("generates text via Gemini API", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{ text: "Test response from Gemini" }]
          }
        }]
      })
    });

    const result = await generateWithGemini(
      "Test prompt",
      { apiKey: "test-key", model: "gemini-3.1-flash-lite" }
    );

    expect(result).toBe("Test response from Gemini");
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const callUrl = mockFetch.mock.calls[0][0];
    expect(callUrl).toContain("generativelanguage.googleapis.com");
    expect(callUrl).toContain("gemini-3.1-flash-lite");
  });

  it("throws on API error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      text: async () => "Rate limit exceeded",
    });

    await expect(
      generateWithGemini("Test prompt", { apiKey: "test-key" })
    ).rejects.toThrow();
  });

  it("uses the default model when not specified", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{
          content: { parts: [{ text: "ok" }] }
        }]
      })
    });

    await generateWithGemini("Test", { apiKey: "test-key" });

    const callUrl = mockFetch.mock.calls[0][0];
    expect(callUrl).toContain("gemini-3.1-flash-lite");
  });
});
