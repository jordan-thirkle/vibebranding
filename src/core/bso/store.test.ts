import { describe, it, expect, beforeEach, vi } from "vitest";
import { getBsoStore, resetBsoStore, BsoStore } from "./store";
import type { BrandStateObject } from "./types";

describe("BsoStore", () => {
  beforeEach(() => {
    resetBsoStore();
  });

  describe("getBsoStore", () => {
    it("returns a singleton instance", () => {
      const a = getBsoStore();
      const b = getBsoStore();
      expect(a).toBe(b);
    });

    it("returns a BsoStore instance", () => {
      const store = getBsoStore();
      expect(store).toBeInstanceOf(BsoStore);
    });
  });

  describe("initial state", () => {
    it("has stage 1 as default", () => {
      const store = getBsoStore();
      expect(store.get().metadata.stage).toBe(1);
    });

    it('has version "1.0.0"', () => {
      const store = getBsoStore();
      expect(store.get().version).toBe("1.0.0");
    });

    it("has empty product name", () => {
      const store = getBsoStore();
      expect(store.get().product.name).toBe("");
    });
  });

  describe("update", () => {
    it("modifies a section of the BSO", () => {
      const store = getBsoStore();
      store.update("product", { name: "TestBrand" });
      expect(store.get().product.name).toBe("TestBrand");
    });

    it("records history entry after update", () => {
      const store = getBsoStore();
      expect(store.getHistory()).toHaveLength(0);
      store.update("product", { name: "TestBrand" });
      expect(store.getHistory()).toHaveLength(1);
    });

    it("records history with correct message", () => {
      const store = getBsoStore();
      store.update("product", { name: "TestBrand" }, "Set product name");
      const entry = store.getHistory()[0];
      expect(entry.message).toBe("Set product name");
    });

    it("updates updatedAt timestamp", () => {
      const store = getBsoStore();
      const before = store.get().metadata.updatedAt;
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);
      store.update("product", { name: "TestBrand" });
      const after = store.get().metadata.updatedAt;
      expect(new Date(after).getTime()).toBeGreaterThan(new Date(before).getTime());
      vi.useRealTimers();
    });

    it("merges with existing data instead of replacing", () => {
      const store = getBsoStore();
      store.update("product", { name: "TestBrand" });
      store.update("product", { tagline: "A new tagline" });
      expect(store.get().product.name).toBe("TestBrand");
      expect(store.get().product.tagline).toBe("A new tagline");
    });
  });

  describe("advanceStage", () => {
    it("increments stage by 1", () => {
      const store = getBsoStore();
      expect(store.get().metadata.stage).toBe(1);
      store.advanceStage();
      expect(store.get().metadata.stage).toBe(2);
    });

    it("stops incrementing at stage 9", () => {
      const store = getBsoStore();
      for (let i = 0; i < 10; i++) {
        store.advanceStage();
      }
      expect(store.get().metadata.stage).toBe(9);
    });
  });

  describe("rollback", () => {
    it("restores previous state after rollback", () => {
      const store = getBsoStore();
      store.update("product", { name: "TestBrand" });
      expect(store.get().product.name).toBe("TestBrand");
      store.rollback(0);
      expect(store.get().product.name).toBe("");
    });

    it("returns false for invalid index", () => {
      const store = getBsoStore();
      expect(store.rollback(-1)).toBe(false);
      expect(store.rollback(5)).toBe(false);
    });

    it("returns true on successful rollback", () => {
      const store = getBsoStore();
      store.update("product", { name: "TestBrand" });
      expect(store.rollback(0)).toBe(true);
    });

    it("trims history after rollback", () => {
      const store = getBsoStore();
      store.update("product", { name: "A" });
      store.update("product", { name: "B" });
      store.rollback(0);
      expect(store.getHistory()).toHaveLength(0);
    });
  });

  describe("toJSON", () => {
    it("returns a valid JSON string", () => {
      const store = getBsoStore();
      const json = store.toJSON();
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it("contains the correct structure", () => {
      const store = getBsoStore();
      store.update("product", { name: "TestBrand" });
      const parsed = JSON.parse(store.toJSON()) as BrandStateObject;
      expect(parsed.product.name).toBe("TestBrand");
      expect(parsed.version).toBe("1.0.0");
      expect(parsed.metadata.stage).toBe(1);
    });
  });

  describe("resetBsoStore", () => {
    it("resets state to defaults", () => {
      const store = getBsoStore();
      store.update("product", { name: "TestBrand" });
      store.advanceStage();
      resetBsoStore();
      const fresh = getBsoStore();
      expect(fresh.get().product.name).toBe("");
      expect(fresh.get().metadata.stage).toBe(1);
    });

    it("creates a new singleton instance", () => {
      const store = getBsoStore();
      resetBsoStore();
      const fresh = getBsoStore();
      expect(fresh).not.toBe(store);
    });
  });

  describe("subscribe", () => {
    it("notifies subscribers on update", () => {
      const store = getBsoStore();
      const fn = vi.fn();
      store.subscribe(fn);
      store.update("product", { name: "TestBrand" });
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("unsubscribes correctly", () => {
      const store = getBsoStore();
      const fn = vi.fn();
      const unsubscribe = store.subscribe(fn);
      unsubscribe();
      store.update("product", { name: "TestBrand" });
      expect(fn).not.toHaveBeenCalled();
    });
  });
});
