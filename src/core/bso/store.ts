import type { BrandStateObject, BsoHistoryEntry, ConsistencyReport } from "./types";
import { BrandStateObjectSchema } from "./schema";
import { loadBSO, saveBSO } from "./persistence";

/**
 * In-memory BSO store. All modules read from and write to this store.
 * Provides version history, rollback, and persistence to JSON.
 */
class BsoStore {
  private bso: BrandStateObject;
  private subscribers: Array<(bso: BrandStateObject) => void> = [];

  constructor(initial?: Partial<BrandStateObject>) {
    this.bso = createDefaultBSO();

    if (initial) {
      this.bso = deepMerge(
        this.bso as unknown as Record<string, unknown>,
        initial as unknown as Record<string, unknown>
      ) as unknown as BrandStateObject;
    }
  }

  /** Get the full current BSO */
  get(): Readonly<BrandStateObject> {
    return this.bso;
  }

  /** Update a section of the BSO and record history */
  update<K extends keyof BrandStateObject>(
    section: K,
    data: Partial<BrandStateObject[K]>,
    message?: string
  ): void {
    const previous = this.bso[section];

    // Deep merge the section (cast to Record for dynamic merging)
    const current = this.bso[section] as unknown as Record<string, unknown>;
    const merged = { ...current, ...(data as unknown as Record<string, unknown>) };
    (this.bso as unknown as Record<string, unknown>)[section as string] = merged;

    this.bso.metadata.updatedAt = new Date().toISOString();

    // Record history
    const entry: BsoHistoryEntry = {
      timestamp: new Date().toISOString(),
      stage: this.bso.metadata.stage,
      message: message || `Updated ${String(section)}`,
      snapshot: { [section]: previous } as Record<string, unknown> as Partial<BrandStateObject>,
    };
    this.bso.metadata.history.push(entry);

    this.notify();
  }

  /** Advance to the next stage */
  advanceStage(): void {
    if (this.bso.metadata.stage < 9) {
      this.bso.metadata.stage++;
      this.bso.metadata.updatedAt = new Date().toISOString();
      this.notify();
    }
  }

  /** Rollback to a specific history entry index */
  rollback(historyIndex: number): boolean {
    if (historyIndex < 0 || historyIndex >= this.bso.metadata.history.length) {
      return false;
    }

    const entry = this.bso.metadata.history[historyIndex];
    const snapshotKeys = Object.keys(entry.snapshot) as Array<keyof BrandStateObject>;

    for (const key of snapshotKeys) {
      const bso = this.bso as unknown as Record<string, unknown>;
      bso[key as string] = (entry.snapshot as Record<string, unknown>)[key as string];
    }

    // Trim history after rollback point
    this.bso.metadata.history = this.bso.metadata.history.slice(0, historyIndex);
    this.bso.metadata.updatedAt = new Date().toISOString();
    this.notify();
    return true;
  }

  /** Set the consistency report */
  setConsistencyReport(report: ConsistencyReport): void {
    this.bso.consistencyReport = report;
    this.bso.metadata.updatedAt = new Date().toISOString();
    this.notify();
  }

  /** Export the full BSO as JSON */
  toJSON(): string {
    return JSON.stringify(this.bso, null, 2);
  }

  /** Validate the BSO against the schema */
  validate(): { valid: boolean; errors?: string[] } {
    const result = BrandStateObjectSchema.safeParse(this.bso);
    if (result.success) {
      return { valid: true };
    }
    return {
      valid: false,
      errors: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    };
  }

  /** Get only the sections relevant to a specific stage */
  getStageContext(stage: number): Partial<BrandStateObject> {
    const ctx: Partial<BrandStateObject> = {
      product: this.bso.product,
    };

    if (stage >= 2) ctx.strategy = this.bso.strategy;
    if (stage >= 3) ctx.verbalIdentity = this.bso.verbalIdentity;
    if (stage >= 4) ctx.visualIdentity = this.bso.visualIdentity;
    if (stage >= 8) ctx.assets = this.bso.assets;

    return ctx;
  }

  /** Get version history for undo/redo UI */
  getHistory(): ReadonlyArray<BsoHistoryEntry> {
    return this.bso.metadata.history;
  }

  /** Subscribe to store changes */
  subscribe(fn: (bso: BrandStateObject) => void): () => void {
    this.subscribers.push(fn);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== fn);
    };
  }

  private notify(): void {
    const snapshot = this.get();
    for (const fn of this.subscribers) {
      fn(snapshot as BrandStateObject);
    }
  }

  /** Persist to localStorage (client) or file (server) */
  async persist(): Promise<void> {
    await saveBSO(this.bso);
  }

  /** Load from persistence */
  static async load(): Promise<BsoStore> {
    const saved = await loadBSO();
    if (saved) {
      return new BsoStore(saved);
    }
    return new BsoStore();
  }
}

// ─── Helpers ─────────────────────────────────────────────────

function createDefaultBSO(): BrandStateObject {
  return {
    version: "1.0.0",
    product: {
      name: "",
      tagline: "",
      description: "",
      category: "",
      audience: {
        demographics: "",
        psychographics: "",
        techSophistication: "medium",
      },
      competitors: [],
    },
    strategy: {
      positioning: "",
      personalityArchetypes: [],
      personalitySpectrum: {
        excitingVsCalm: 50,
        modernVsClassic: 50,
        playfulVsSerious: 50,
        accessibleVsExclusive: 50,
        boldVsUnderstated: 50,
      },
      brandValues: [],
      toneOfVoice: {
        formalToCasual: 50,
        seriousToWitty: 50,
        authoritativeToApproachable: 50,
        conventionalToIrreverent: 50,
      },
      emotionalTerritory: "",
    },
    visualIdentity: {},
    verbalIdentity: {},
    assets: {
      generated: [],
      exportFormats: [],
    },
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stage: 1,
      history: [],
    },
  };
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      output[key] = deepMerge(
        (target[key] as Record<string, unknown>) || {},
        source[key] as Record<string, unknown>
      );
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

// ─── Singleton ───────────────────────────────────────────────

let storeInstance: BsoStore | null = null;

export function getBsoStore(): BsoStore {
  if (!storeInstance) {
    storeInstance = new BsoStore();
  }
  return storeInstance;
}

export function resetBsoStore(): void {
  storeInstance = new BsoStore();
}

export { BsoStore };
