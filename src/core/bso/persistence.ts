import type { BrandStateObject } from "./types";

const STORAGE_KEY = "vibebranding_bso";

/**
 * Persistence layer for the BSO.
 * In the browser, uses localStorage.
 * On the server (API routes), uses a file or in-memory store.
 */

export async function saveBSO(bso: BrandStateObject): Promise<void> {
  if (typeof window !== "undefined") {
    // Client-side: localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bso));
    } catch (e) {
      console.error("Failed to save BSO to localStorage:", e);
    }
  } else {
    // Server-side: write to file (but only if in Node.js)
    try {
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const filePath = path.join(process.cwd(), "exports", "bso.json");
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(bso, null, 2), "utf-8");
    } catch {
      // File write may fail in edge runtime — silent fallback
    }
  }
}

export async function loadBSO(): Promise<Partial<BrandStateObject> | null> {
  if (typeof window !== "undefined") {
    // Client-side: localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as Partial<BrandStateObject>;
      }
    } catch (e) {
      console.error("Failed to load BSO from localStorage:", e);
    }
    return null;
  }

  // Server-side: read from file
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const filePath = path.join(process.cwd(), "exports", "bso.json");
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as Partial<BrandStateObject>;
  } catch {
    return null;
  }
}

export function clearBSO(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
