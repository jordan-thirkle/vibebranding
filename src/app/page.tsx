"use client";

import { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────

interface StageResult {
  stage: number;
  data: Record<string, unknown>;
}

interface BsoState {
  stage: number;
  product?: { name: string };
  strategy?: {
    personalityArchetypes?: Array<{ archetype: string; weight: number }>;
    emotionalTerritory?: string;
    brandValues?: string[];
    toneOfVoice?: Record<string, number>;
  };
  visualIdentity?: {
    colourSystem?: { primaryColour: string; secondaryColour: string; accentColour: string; harmonyType: string };
    typography?: { displayFont: { name: string }; textFont: { name: string } };
    logo?: { typology?: string; concepts?: Array<{ imageUrl?: string; description?: string }> };
  };
  verbalIdentity?: {
    taglines?: Array<{ text: string }>;
    messagingHierarchy?: { heroHeadline: string; primaryCTA: string };
  };
}

// ─── Stage Config ────────────────────────────────────────────

const STAGES = [
  { num: 1, label: "Discovery", icon: "🔍" },
  { num: 2, label: "Strategy", icon: "🎯" },
  { num: 3, label: "Naming", icon: "🏷️" },
  { num: 4, label: "Visual", icon: "🎨" },
  { num: 5, label: "Logo", icon: "🖼️" },
  { num: 6, label: "Voice", icon: "✍️" },
  { num: 7, label: "Assets", icon: "📦" },
  { num: 8, label: "Guidelines", icon: "📋" },
  { num: 9, label: "Export", icon: "🚀" },
];

// ─── Main Component ──────────────────────────────────────────

export default function Home() {
  const [productInput, setProductInput] = useState({
    name: "",
    description: "",
    category: "SaaS",
    audience: "",
    competitors: "",
  });
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0); // 0 = input form
  const [results, setResults] = useState<StageResult[]>([]);
  const [bso, setBso] = useState<BsoState | null>(null);
  const [error, setError] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState("");

  const runPipeline = useCallback(async () => {
    if (!productInput.name || !productInput.description) {
      setError("Product name and description are required.");
      return;
    }
    setError("");
    setExportError("");
    setLoading(true);
    setResults([]);
    setCurrentStage(1);

    try {
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: productInput.name,
          description: productInput.description,
          category: productInput.category,
          audienceDemographics: productInput.audience,
          competitors: productInput.competitors.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.errors?.join(", ") || data.error || "Generation failed");
        return;
      }

      // Store BSO
      if (data.bso) setBso(data.bso);

      // Build stage results from API response
      const stageResults: StageResult[] = [];
      if (data.results?.discovery) stageResults.push({ stage: 1, data: data.results.discovery as Record<string, unknown> });
      if (data.results?.strategy) stageResults.push({ stage: 2, data: data.results.strategy as Record<string, unknown> });
      if (data.results?.naming) stageResults.push({ stage: 3, data: data.results.naming as Record<string, unknown> });
      if (data.results?.visual) stageResults.push({ stage: 4, data: data.results.visual as Record<string, unknown> });
      if (data.results?.verbal) stageResults.push({ stage: 6, data: data.results.verbal as Record<string, unknown> });

      setResults(stageResults);
      setCurrentStage(data.stage || 6);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error — check your connection");
    } finally {
      setLoading(false);
    }
  }, [productInput]);

  const handleExport = useCallback(async (format: string) => {
    setExportLoading(true);
    setExportError("");
    try {
      const res = await fetch("/api/brand/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      });
      const data = await res.json();

      if (!data.success) {
        setExportError(data.error || "Export failed");
        return;
      }

      if (format === "all" || format === "html") {
        // Trigger download for each file
        for (const [key, file] of Object.entries(data.files) as Array<[string, { filename: string; content: string; contentType: string }]>) {
          if (format !== "all" && key !== format) continue;
          const blob = new Blob([file.content], { type: file.contentType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.filename;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExportLoading(false);
    }
  }, []);

  return (
    <div className="flex h-full">
      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h1 className="text-lg font-bold tracking-tight">VibeBranding</h1>
          <p className="text-xs text-zinc-500 mt-0.5">AI Brand Identity Generator</p>
        </div>

        {/* Stage Progress */}
        <nav className="flex flex-col gap-1">
          {STAGES.map((s) => {
            const isActive = currentStage === s.num;
            const isDone = currentStage > s.num;
            const stateClass = isActive ? "stage-active" : isDone ? "stage-done" : "stage-pending";
            return (
              <div
                key={s.num}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${stateClass}`}
              >
                <span className="text-base">{s.icon}</span>
                <span>{s.label}</span>
                {isActive && loading && (
                  <span className="ml-auto w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {isDone && <span className="ml-auto text-xs opacity-75">✓</span>}
              </div>
            );
          })}
        </nav>

        {/* BSO Preview */}
        {bso && (
          <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Brand State</h3>
            <div className="text-xs space-y-1 text-zinc-500">
              {bso.product?.name && <p>Name: <span className="text-zinc-700 dark:text-zinc-300 font-medium">{bso.product.name}</span></p>}
              {bso.strategy?.emotionalTerritory && (
                <p>Territory: <span className="text-zinc-700 dark:text-zinc-300 font-medium">{(bso.strategy.emotionalTerritory as string).slice(0, 40)}</span></p>
              )}
              {bso.visualIdentity?.colourSystem && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-3 h-3 rounded-full border border-zinc-300" style={{ backgroundColor: bso.visualIdentity.colourSystem.primaryColour }} />
                  <span className="w-3 h-3 rounded-full border border-zinc-300" style={{ backgroundColor: bso.visualIdentity.colourSystem.secondaryColour }} />
                  <span className="w-3 h-3 rounded-full border border-zinc-300" style={{ backgroundColor: bso.visualIdentity.colourSystem.accentColour }} />
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* ── Main Content ────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-2xl mx-auto">
          {currentStage === 0 && !loading && (
            <ProductForm
              input={productInput}
              onChange={setProductInput}
              onSubmit={runPipeline}
              error={error}
            />
          )}

          {loading && (
            <LoadingState currentStage={currentStage} stages={STAGES} />
          )}

          {!loading && results.length > 0 && (
            <ResultsView
              results={results}
              bso={bso}
              onReset={() => { setCurrentStage(0); setResults([]); setBso(null); setError(""); setExportError(""); }}
              onExport={handleExport}
              exportLoading={exportLoading}
              exportError={exportError}
            />
          )}

          {/* Error boundary fallback */}
          {!loading && results.length === 0 && currentStage > 0 && !error && (
            <div className="text-center py-20">
              <p className="text-zinc-400">Results not available. Click below to start again.</p>
              <button
                onClick={() => { setCurrentStage(0); setResults([]); setBso(null); setError(""); }}
                className="mt-4 px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                Start New Brand
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Product Form ────────────────────────────────────────────

function ProductForm({
  input,
  onChange,
  onSubmit,
  error,
}: {
  input: { name: string; description: string; category: string; audience: string; competitors: string };
  onChange: (v: typeof input) => void;
  onSubmit: () => void;
  error: string;
}) {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Create Your Brand Identity</h2>
        <p className="text-zinc-500 mt-1">Describe your product and VibeBranding will generate a complete brand system — strategy, naming, colours, typography, voice, and launch assets.</p>
      </div>

      <div className="space-y-5">
        <Field label="Product Name" hint="What's your product called? (can be a working title)">
          <input
            type="text"
            value={input.name}
            onChange={(e) => onChange({ ...input, name: e.target.value })}
            placeholder="e.g., PixelForge, Draftly, FlowKit"
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </Field>

        <Field label="Description" hint="What does it do? Be specific.">
          <textarea
            value={input.description}
            onChange={(e) => onChange({ ...input, description: e.target.value })}
            placeholder="e.g., An AI-powered design tool that transforms rough sketches into production-ready UI components..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
        </Field>

        <Field label="Category" hint="What kind of product is this?">
          <select
            value={input.category}
            onChange={(e) => onChange({ ...input, category: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>SaaS</option>
            <option>Developer Tool</option>
            <option>Consumer App</option>
            <option>Creative Tool</option>
            <option>Marketplace</option>
            <option>AI / ML Product</option>
            <option>API Service</option>
            <option>Mobile App</option>
            <option>Game</option>
          </select>
        </Field>

        <Field label="Target Audience" hint="Who will use this? Demographics, role, tech level.">
          <input
            type="text"
            value={input.audience}
            onChange={(e) => onChange({ ...input, audience: e.target.value })}
            placeholder="e.g., UI/UX designers and frontend devs, age 22-40"
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </Field>

        <Field label="Competitors" hint="Comma-separated list (optional)">
          <input
            type="text"
            value={input.competitors}
            onChange={(e) => onChange({ ...input, competitors: e.target.value })}
            placeholder="e.g., Figma, Canva, Galileo AI"
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </Field>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          {error}
          {error.includes("429") && (
            <p className="mt-1 text-xs text-red-500">
              Gemini API quota exceeded. Free tier allows ~20 requests/day. Your brand will work once quota resets.
            </p>
          )}
          {error.includes("Network") && (
            <p className="mt-1 text-xs text-red-500">
              Check your internet connection and try again.
            </p>
          )}
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={!input.name || !input.description}
        className="mt-6 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Generate Brand Identity →
      </button>

      <p className="mt-3 text-xs text-zinc-400 text-center">
        Powered by Gemini 3.5 Flash • Stages 1-8 run automatically
      </p>
    </div>
  );
}

// ─── Form Field ──────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
      <p className="mt-1 text-xs text-zinc-400">{hint}</p>
    </div>
  );
}

// ─── Loading State ───────────────────────────────────────────

function LoadingState({ currentStage, stages }: { currentStage: number; stages: typeof STAGES }) {
  const stage = stages[currentStage - 1];
  const stageMessages: Record<number, string> = {
    1: "Analyzing product positioning and market landscape...",
    2: "Identifying brand archetypes and emotional territory...",
    3: "Generating and scoring name candidates...",
    4: "Crafting colour palette and typography system...",
    5: "Designing logo concepts and visual identity...",
    6: "Developing brand voice and messaging hierarchy...",
    7: "Creating application and asset specifications...",
    8: "Compiling brand guidelines document...",
    9: "Running consistency checks and preparing export...",
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6" />
      <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
        Running {stage?.label || "brand pipeline"}...
      </p>
      <p className="text-sm text-zinc-400 mt-2 max-w-md text-center">
        {stageMessages[currentStage] || "Processing your brand identity..."}
      </p>
      <div className="mt-6 flex gap-1.5">
        {stages.slice(0, currentStage - 1).map((s) => (
          <span key={s.num} className="w-2 h-2 rounded-full bg-blue-400" />
        ))}
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
        {stages.slice(currentStage).map((s) => (
          <span key={s.num} className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        ))}
      </div>
    </div>
  );
}

// ─── Results View ────────────────────────────────────────────

function ResultsView({
  results, bso, onReset, onExport, exportLoading, exportError,
}: {
  results: StageResult[];
  bso: BsoState | null;
  onReset: () => void;
  onExport: (format: string) => void;
  exportLoading: boolean;
  exportError: string;
}) {
  const discovery = results.find((r) => r.stage === 1)?.data as {
    positioning?: string;
  } | undefined;
  const strategy = results.find((r) => r.stage === 2)?.data as {
    archetypes?: Array<{ name: string; weight: number }>;
    emotionalTerritory?: string;
    values?: string[];
  } | undefined;
  const naming = results.find((r) => r.stage === 3)?.data as {
    candidates?: Array<{ name: string; scores?: { overall: number } }>;
  } | undefined;
  const visual = results.find((r) => r.stage === 4)?.data as {
    colour?: { primary: string; secondary: string; accent: string; harmony: string; wcag: string };
    typography?: { display: string; text: string; mono?: string };
    iconography?: { strokeWeight?: number; cornerRadius?: number; fillApproach?: string; icons?: string };
    motion?: { duration?: string; easing?: string; style?: string; tokens?: string };
  } | undefined;
  const verbal = results.find((r) => r.stage === 6)?.data as {
    taglines?: Array<{ text: string; score: number }>;
    heroHeadline?: string;
    primaryCTA?: string;
  } | undefined;

  const logoConcepts = bso?.visualIdentity?.logo?.concepts || [];
  const hasLogoImages = logoConcepts.some((c) => c.imageUrl);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Your Brand Identity</h2>
        <div className="flex items-center gap-2">
          {bso?.product?.name && (
            <span className="text-sm text-zinc-400 mr-2">{bso.product.name}</span>
          )}
          <button onClick={onReset} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            ← New Brand
          </button>
        </div>
      </div>

      {/* Strategy Card */}
      {strategy && (
        <Card title="🎯 Brand Strategy" colour="border-l-blue-500">
          <div className="space-y-3">
            {strategy.archetypes && (
              <div>
                <Label>Archetypes</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(strategy.archetypes as Array<{ name: string; weight: number }>).map((a) => (
                    <span key={a.name} className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                      {a.name} {a.weight}%
                    </span>
                  ))}
                </div>
              </div>
            )}
            {strategy.emotionalTerritory && (
              <div>
                <Label>Emotional Territory</Label>
                <p className="text-lg font-semibold italic">{(strategy.emotionalTerritory as string).slice(0, 80)}</p>
              </div>
            )}
            {strategy.values && (
              <div>
                <Label>Brand Values</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(strategy.values as string[]).slice(0, 5).map((v) => (
                    <span key={v} className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs">{v}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Naming Card */}
      {naming && (
        <Card title="🏷️ Name Candidates" colour="border-l-emerald-500">
          <div className="flex flex-wrap gap-2">
            {(naming.candidates as Array<{ name: string; scores?: { overall: number } }>).slice(0, 10).map((c, i) => (
              <span key={c.name} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${i === 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}>
                {c.name}
                {c.scores && <span className="ml-1.5 text-xs opacity-60">{c.scores.overall}/10</span>}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Visual Card */}
      {visual && (
        <Card title="🎨 Visual Identity" colour="border-l-purple-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {(visual.colour as Record<string, string>) && (
              <div>
                <Label>Colour Palette</Label>
                <div className="flex gap-3 mt-2">
                  {["primary", "secondary", "accent"].map((role) => {
                    const hex = (visual.colour as Record<string, string>)[role];
                    if (!hex) return null;
                    return (
                      <div key={role} className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700" style={{ backgroundColor: hex }} />
                        <span className="text-[10px] text-zinc-500">{role}</span>
                        <span className="text-[10px] font-mono text-zinc-400">{hex}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  Harmony: {(visual.colour as Record<string, string>).harmony || "—"} • WCAG: {(visual.colour as Record<string, string>).wcag || "—"}
                </p>
              </div>
            )}
            {(visual.typography as Record<string, string>) && (
              <div>
                <Label>Typography</Label>
                <p className="text-sm mt-1">
                  <strong>{(visual.typography as Record<string, string>).display || "—"}</strong>
                  <span className="text-zinc-400"> display</span>
                </p>
                <p className="text-sm">
                  <strong>{(visual.typography as Record<string, string>).text || "—"}</strong>
                  <span className="text-zinc-400"> text</span>
                </p>
                {(visual.typography as Record<string, string>).mono && (
                  <p className="text-sm text-zinc-500">
                    {(visual.typography as Record<string, string>).mono} <span className="text-zinc-400">mono</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Iconography + Motion summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            {visual.iconography && (
              <div>
                <Label>Icon System</Label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {visual.iconography.strokeWeight}px stroke • {visual.iconography.fillApproach}
                </p>
                <p className="text-xs text-zinc-400">{visual.iconography.icons || ""}</p>
              </div>
            )}
            {visual.motion && (
              <div>
                <Label>Motion Language</Label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {visual.motion.duration} • {visual.motion.easing}
                </p>
                <p className="text-xs text-zinc-400">{visual.motion.tokens || ""}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Logo Card */}
      {bso?.visualIdentity?.logo && (
        <Card title="🖼️ Logo" colour="border-l-rose-500">
          <div className="space-y-3">
            <div>
              <Label>Typology</Label>
              <p className="text-sm font-medium mt-1 capitalize">{bso.visualIdentity.logo.typology}</p>
            </div>
            {hasLogoImages && (
              <div className="flex flex-wrap gap-4 mt-2">
                {logoConcepts.filter((c) => c.imageUrl).slice(0, 4).map((c, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <img
                      src={c.imageUrl}
                      alt={`Logo concept ${i + 1}`}
                      className="w-24 h-24 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white object-contain p-2"
                    />
                    <span className="text-[10px] text-zinc-400">Concept {i + 1}</span>
                  </div>
                ))}
              </div>
            )}
            {!hasLogoImages && process.env.NEXT_PUBLIC_REPLICATE_BILLING === "1" && (
              <p className="text-sm text-zinc-500 italic">
                Logo images will appear here after Replicate billing is configured.
              </p>
            )}
            {!hasLogoImages && (
              <p className="text-sm text-zinc-400">
                SVG logo generation with Recraft V4.1 uses Replicate. To enable, add billing at{' '}
                <a href="https://replicate.com/account/billing" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                  replicate.com/account/billing
                </a>.
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Verbal Card */}
      {verbal && (
        <Card title="✍️ Brand Voice" colour="border-l-amber-500">
          <div className="space-y-3">
            {(verbal.heroHeadline as string) && (
              <div>
                <Label>Hero Headline</Label>
                <p className="text-lg font-semibold">{(verbal.heroHeadline as string).slice(0, 100)}</p>
              </div>
            )}
            {verbal.taglines && (
              <div>
                <Label>Taglines</Label>
                <div className="space-y-1 mt-1">
                  {(verbal.taglines as Array<{ text: string; score: number }>).slice(0, 5).map((t, i) => (
                    <p key={i} className="text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="text-zinc-400 mr-2">"{t.text}"</span>
                      {t.score && <span className="text-xs text-zinc-400">{t.score}/10</span>}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {(verbal.primaryCTA as string) && (
              <div>
                <Label>Primary CTA</Label>
                <span className="inline-block mt-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">
                  {(verbal.primaryCTA as string)}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Positioning */}
      {discovery?.positioning && (
        <Card title="📍 Positioning" colour="border-l-zinc-400">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">
            {discovery.positioning}
          </p>
        </Card>
      )}

      {/* Export Section */}
      <Card title="🚀 Export" colour="border-l-blue-600">
        <p className="text-sm text-zinc-500 mb-4">
          Download your brand kit in any format. Each file is pre-configured with your brand tokens.
        </p>
        <div className="flex flex-wrap gap-2">
          <ExportButton label="CSS Tokens" format="css" onExport={onExport} loading={exportLoading} />
          <ExportButton label="Tailwind Config" format="tailwind" onExport={onExport} loading={exportLoading} />
          <ExportButton label="SCSS Variables" format="scss" onExport={onExport} loading={exportLoading} />
          <ExportButton label="Figma Styles" format="figma" onExport={onExport} loading={exportLoading} />
          <ExportButton label="HTML Guidelines" format="html" onExport={onExport} loading={exportLoading} />
          <ExportButton label="Download All" format="all" onExport={onExport} loading={exportLoading} highlighted />
        </div>
        {exportError && (
          <p className="mt-2 text-xs text-red-500">{exportError}</p>
        )}
      </Card>
    </div>
  );
}

// ─── Export Button ───────────────────────────────────────────

function ExportButton({
  label, format, onExport, loading, highlighted,
}: {
  label: string;
  format: string;
  onExport: (format: string) => void;
  loading: boolean;
  highlighted?: boolean;
}) {
  return (
    <button
      onClick={() => onExport(format)}
      disabled={loading}
      className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
        highlighted
          ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50"
      }`}
    >
      {loading ? "..." : label}
    </button>
  );
}

// ─── Shared Components ───────────────────────────────────────

function Card({ title, colour, children }: { title: string; colour: string; children: React.ReactNode }) {
  return (
    <div className={`border-l-4 ${colour} rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm`}>
      <h3 className="font-semibold text-sm mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{children}</span>;
}
