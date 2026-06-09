import { describe, it, expect } from "vitest";
import { BrandPipelineInputSchema } from "./input-schema";

describe("BrandPipelineInputSchema", () => {
  it("validates a minimal valid input", () => {
    const result = BrandPipelineInputSchema.safeParse({
      productName: "MyApp",
      description: "A great app",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty product name", () => {
    const result = BrandPipelineInputSchema.safeParse({
      productName: "",
      description: "A great app",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("productName");
    }
  });

  it("rejects long descriptions (>5000 chars)", () => {
    const result = BrandPipelineInputSchema.safeParse({
      productName: "MyApp",
      description: "x".repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it("defaults category to SaaS", () => {
    const result = BrandPipelineInputSchema.safeParse({
      productName: "MyApp",
      description: "A great app",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe("SaaS");
    }
  });

  it("defaults competitors to empty array", () => {
    const result = BrandPipelineInputSchema.safeParse({
      productName: "MyApp",
      description: "A great app",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.competitors).toEqual([]);
    }
  });

  it("accepts competitors as an array of strings", () => {
    const result = BrandPipelineInputSchema.safeParse({
      productName: "MyApp",
      description: "A great app",
      competitors: ["Competitor A", "Competitor B"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts competitors as a single string", () => {
    const result = BrandPipelineInputSchema.safeParse({
      productName: "MyApp",
      description: "A great app",
      competitors: "Competitor A, Competitor B",
    });
    expect(result.success).toBe(true);
  });

  it("rejects more than 20 competitors", () => {
    const competitors = Array.from({ length: 21 }, (_, i) => `Competitor ${i}`);
    const result = BrandPipelineInputSchema.safeParse({
      productName: "MyApp",
      description: "A great app",
      competitors,
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional keywords and inspirations", () => {
    const result = BrandPipelineInputSchema.safeParse({
      productName: "MyApp",
      description: "A great app",
      keywords: ["modern", "clean"],
      inspirations: ["Apple", "Tesla"],
    });
    expect(result.success).toBe(true);
  });
});
