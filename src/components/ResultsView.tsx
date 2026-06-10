import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import Label from "@/components/Label";
import ExportButton from "@/components/ExportButton";

interface StageResult {
  stage: number;
  data: Record<string, unknown>;
}

interface ColourSystem {
  primaryColour: string;
  secondaryColour: string;
  accentColour: string;
  harmonyType: string;
}

interface Logo {
  typology?: string;
  concepts?: Array<{ imageUrl?: string; description?: string }>;
}

interface VisualIdentity {
  colourSystem?: ColourSystem;
  typography?: { displayFont: { name: string }; textFont: { name: string } };
  logo?: Logo;
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
  visualIdentity?: VisualIdentity;
  verbalIdentity?: {
    taglines?: Array<{ text: string }>;
    messagingHierarchy?: { heroHeadline: string; primaryCTA: string };
  };
}

interface ResultsViewProps {
  results: StageResult[];
  bso: BsoState | null;
  onReset: () => void;
  onExport: (format: string) => void;
  exportLoading: boolean;
  exportError: string;
}

export default function ResultsView({
  results, bso, onReset, onExport, exportLoading, exportError,
}: ResultsViewProps) {
  const router = useRouter();
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
    <div className="vb-fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold tracking-tight">Your Brand Identity</h2>
        <div className="flex items-center gap-2">
          {bso?.product?.name && (
            <span className="text-sm text-zinc-500 mr-2 hidden sm:inline">{bso.product.name}</span>
          )}
          <button
            onClick={() => router.push('/dashboard')}
            className="min-h-[44px] px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            aria-label="View saved brand in dashboard"
          >
            📁 My Brands
          </button>
          <button onClick={onReset} className="text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap">
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
                        <div className="w-11 h-11 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700" style={{ backgroundColor: hex }} role="img" aria-label={`${role} colour: ${hex}`} />
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
                <p className="text-xs text-zinc-500">{visual.iconography.icons || ""}</p>
              </div>
            )}
            {visual.motion && (
              <div>
                <Label>Motion Language</Label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {visual.motion.duration} • {visual.motion.easing}
                </p>
                <p className="text-xs text-zinc-500">{visual.motion.tokens || ""}</p>
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
              <p className="text-sm text-zinc-500">
                SVG logo generation with Recraft V4.1 uses Replicate. To enable, add billing at{' '}
                <a href="https://replicate.com/account/billing" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
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
                      <span className="text-zinc-500 mr-2">&ldquo;{t.text}&rdquo;</span>
                      {t.score && <span className="text-xs text-zinc-500">{t.score}/10</span>}
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
        <Card title="📍 Positioning" colour="border-l-zinc-500">
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
          <p className="mt-2 text-xs text-red-500" role="alert" aria-live="polite">{exportError}</p>
        )}
      </Card>
    </div>
  );
}
