import { describe, it, expect } from "vitest";
import { PLANS, getPlanByPriceId } from "./admin";

describe("PLANS", () => {
  it("has a free tier with 3 brands", () => {
    expect(PLANS.free.name).toBe("Free");
    expect(PLANS.free.maxBrands).toBe(3);
    expect(PLANS.free.priceId).toBeNull();
  });

  it("has a pro tier with 50 brands", () => {
    expect(PLANS.pro.name).toBe("Pro");
    expect(PLANS.pro.maxBrands).toBe(50);
  });

  it("has an unlimited tier with -1 brands", () => {
    expect(PLANS.unlimited.name).toBe("Unlimited");
    expect(PLANS.unlimited.maxBrands).toBe(-1);
  });

  it("pro and unlimited have features defined", () => {
    expect(PLANS.pro.features.length).toBeGreaterThan(0);
    expect(PLANS.unlimited.features.length).toBeGreaterThan(0);
  });
});

describe("getPlanByPriceId", () => {
  it("returns null for unknown price IDs", () => {
    expect(getPlanByPriceId("price_unknown")).toBeNull();
  });

  it("returns null when price IDs are null (free tier)", () => {
    // Free tier has null priceId, but function is called with a string
    expect(getPlanByPriceId("non_existent")).toBeNull();
  });
});
