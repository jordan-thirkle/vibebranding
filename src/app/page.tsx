"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import ProductForm from "@/components/ProductForm";
import LoadingState from "@/components/LoadingState";
import ResultsView from "@/components/ResultsView";
import ErrorBoundary from "@/components/ErrorBoundary";

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
  const [currentStage, setCurrentStage] = useState(0);
  const [results, setResults] = useState<StageResult[]>([]);
  const [bso, setBso] = useState<BsoState | null>(null);
  const [error, setError] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

      if (data.bso) setBso(data.bso);

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
      {/* Hamburger button (mobile only) */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={sidebarOpen}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className={`w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col gap-6 overflow-y-auto ${
        sidebarOpen ? "fixed inset-y-0 left-0 z-40 shadow-xl" : "hidden"
      } lg:flex lg:relative lg:shadow-none`}>
        <div>
          <h1 className="text-lg font-bold tracking-tight">VibeBranding</h1>
          <p className="text-xs text-zinc-500 mt-0.5">AI Brand Identity Generator</p>
          <Link href="/brand" className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-700 underline">
            Our Brand Identity →
          </Link>
          <Link href="/devlog" className="ml-2 inline-block text-xs text-zinc-500 hover:text-zinc-700 underline">
            Devlog
          </Link>
        </div>

        {/* Stage Progress */}
        <nav>
          <ol role="list" aria-label="Brand generation stages" className="flex flex-col gap-1">
            {STAGES.map((s) => {
              const isActive = currentStage === s.num;
              const isDone = currentStage > s.num;
              const stateClass = isActive ? "stage-active" : isDone ? "stage-done" : "stage-pending";
              return (
                <li key={s.num}>
                  <button
                    type="button"
                    tabIndex={isActive || isDone ? 0 : -1}
                    disabled={!isActive && !isDone}
                    aria-current={isActive ? "step" : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full text-left ${stateClass}`}
                  >
                    <span className="text-base">{s.icon}</span>
                    <span>{s.label}</span>
                    {isActive && loading && (
                      <span className="ml-auto w-4 h-4 border-2 border-white/30 border-t-white rounded-full vb-spin" />
                    )}
                    {isDone && <span className="ml-auto text-xs opacity-75">✓</span>}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* BSO Preview */}
        {bso && (
          <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Brand State</h3>
            <div className="text-xs space-y-1 text-zinc-500">
              {bso.product?.name && <p>Name: <span className="text-zinc-700 dark:text-zinc-300 font-medium">{bso.product.name}</span></p>}
              {bso.strategy?.emotionalTerritory && (
                <p>Territory: <span className="text-zinc-700 dark:text-zinc-300 font-medium">{(bso.strategy.emotionalTerritory as string).slice(0, 40)}</span></p>
              )}
              {bso.visualIdentity?.colourSystem && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-3 h-3 rounded-full border border-zinc-300" style={{ backgroundColor: bso.visualIdentity.colourSystem.primaryColour }} role="img" aria-label={`Primary: ${bso.visualIdentity.colourSystem.primaryColour}`} />
                  <span className="w-3 h-3 rounded-full border border-zinc-300" style={{ backgroundColor: bso.visualIdentity.colourSystem.secondaryColour }} role="img" aria-label={`Secondary: ${bso.visualIdentity.colourSystem.secondaryColour}`} />
                  <span className="w-3 h-3 rounded-full border border-zinc-300" style={{ backgroundColor: bso.visualIdentity.colourSystem.accentColour }} role="img" aria-label={`Accent: ${bso.visualIdentity.colourSystem.accentColour}`} />
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* ── Main Content ────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12 pt-16 lg:pt-12">
        <div className="max-w-2xl mx-auto">
          <ErrorBoundary>
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
          </ErrorBoundary>

          {/* Recovery prompt */}
          {!loading && results.length === 0 && currentStage > 0 && !error && (
            <div className="text-center py-20">
              <p className="text-zinc-500">Results not available. Click below to start again.</p>
              <button
                onClick={() => { setCurrentStage(0); setResults([]); setBso(null); setError(""); }}
                className="mt-4 px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 min-h-[44px]"
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
