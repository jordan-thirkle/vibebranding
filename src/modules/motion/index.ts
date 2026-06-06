/**
 * Motion & Animation Module (Stage 5)
 *
 * Defines how the brand moves:
 * - Motion personality (duration, easing, style)
 * - CSS/JS animation token set
 * - Reference animations
 * - Logo sting specification
 */

import { getBsoStore } from "@/core/bso";
import type { MotionLanguageInfo, MotionReference, MotionLogoSting, VisualIdentityInfo } from "@/core/bso/types";

export interface MotionOutput {
  success: boolean;
  duration: string;
  easing: string;
  style: string;
  tokenCount: number;
}

/**
 * Generate motion language based on brand archetype and personality.
 * Uses deterministic rules derived from strategy data.
 */
export function runMotion(): MotionOutput {
  const store = getBsoStore();
  const bso = store.get();

  if (!bso.strategy.personalityArchetypes.length) {
    return { success: false, duration: "", easing: "", style: "", tokenCount: 0 };
  }

  const archetypes = bso.strategy.personalityArchetypes.map((a) => a.archetype);
  const spectrum = bso.strategy.personalitySpectrum;

  // ── Determine Motion Personality ────────────────────
  const isPlayful = archetypes.some((a) => ["Jester", "Creator", "Explorer"].includes(a));
  const isAuthoritative = archetypes.some((a) => ["Sage", "Ruler"].includes(a));
  const isBold = spectrum.boldVsUnderstated > 70;

  const duration = isPlayful ? "quick" : isAuthoritative ? "snappy" : "quick";
  const easing = isPlayful ? "spring" : isAuthoritative ? "sharp" : "smooth";
  const style = isBold ? "personality_forward" : isPlayful ? "expressive" : "functional";

  // ── Generate Motion Tokens ──────────────────────────
  const durations = {
    snappy: { instant: "100ms", fast: "150ms", normal: "200ms", slow: "400ms" },
    quick: { instant: "100ms", fast: "200ms", normal: "300ms", slow: "500ms" },
    deliberate: { instant: "150ms", fast: "300ms", normal: "500ms", slow: "800ms" },
    languid: { instant: "200ms", fast: "400ms", normal: "700ms", slow: "1200ms" },
  }[duration];

  const easings = {
    sharp: {
      standard: "cubic-bezier(0.4, 0, 0.2, 1)",
      enter: "cubic-bezier(0, 0, 0.2, 1)",
      exit: "cubic-bezier(0.4, 0, 1, 1)",
    },
    smooth: {
      standard: "cubic-bezier(0.2, 0, 0, 1)",
      enter: "cubic-bezier(0.2, 0, 0, 1)",
      exit: "cubic-bezier(0.4, 0, 0.6, 1)",
    },
    spring: {
      standard: "linear(0, 0.35 5%, 0.8 20%, 0.95 35%, 1.02 50%, 1 65%, 0.98 80%, 1)",
      enter: "linear(0, 0.5 10%, 0.85 30%, 0.98 50%, 1.01 60%, 1 75%, 0.99 90%, 1)",
      exit: "cubic-bezier(0.4, 0, 0.6, 1)",
    },
  }[easing];

  const cssTokens = [
    "  /* ── Duration Tokens ── */",
    `  --motion-duration-instant: ${durations.instant};`,
    `  --motion-duration-fast: ${durations.fast};`,
    `  --motion-duration-normal: ${durations.normal};`,
    `  --motion-duration-slow: ${durations.slow};`,
    "",
    "  /* ── Easing Tokens ── */",
    `  --motion-easing-standard: ${easings.standard};`,
    `  --motion-easing-enter: ${easings.enter};`,
    `  --motion-easing-exit: ${easings.exit};`,
    "",
    "  /* ── Delay Tokens ── */",
    "  --motion-delay-micro: 50ms;",
    "  --motion-delay-stagger: 75ms;",
  ].join("\n");

  // ── Reference Animations ────────────────────────────
  const references: MotionReference[] = [
    {
      name: "Page Transition",
      description: "Fade + subtle slide up on page enter",
      cssKeyframes: `@keyframes page-enter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`,
      duration: durations.normal,
      easing: easings.enter,
    },
    {
      name: "Button Hover",
      description: "Scale up slightly with shadow lift",
      cssKeyframes: `.btn:hover { transform: scale(1.02); transition: transform var(--motion-duration-fast) var(--motion-easing-standard); }`,
      duration: durations.fast,
      easing: easings.standard,
    },
    {
      name: "Card Hover Lift",
      description: "Cards lift on hover with shadow increase",
      cssKeyframes: `.card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); transition: all var(--motion-duration-normal) var(--motion-easing-standard); }`,
      duration: durations.normal,
      easing: easings.standard,
    },
    {
      name: "Loading Spinner",
      description: "Rotating ring/spinner for loading states",
      cssKeyframes: `@keyframes spin { to { transform: rotate(360deg); } } .spinner { animation: spin 1s linear infinite; }`,
      duration: "1s",
      easing: "linear",
    },
    {
      name: "Toast Notification",
      description: "Slide in from right, auto-dismiss",
      cssKeyframes: `@keyframes toast-enter { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }`,
      duration: durations.normal,
      easing: easings.enter,
    },
  ];

  // ── Logo Sting ──────────────────────────────────────
  const logoSting: MotionLogoSting = {
    entryAnimation: `${bso.product.name} logo mark draws on (stroke animation) over ${durations.slow} with ${easings.enter}, then the wordmark fades in over ${durations.fast}`,
    loopAnimation: "Subtle floating/bobbing on the icon mark (translateY ±2px over 3s, loop)",
    exitAnimation: undefined,
    totalDuration: durations.slow,
  };

  // ── Update BSO ──────────────────────────────────────
  const motionLanguage: MotionLanguageInfo = {
    personality: {
      duration,
      easing,
      style,
    },
    tokens: {
      css: cssTokens,
      js: `export const motion = { duration: ${JSON.stringify(durations)}, easing: ${JSON.stringify(easings)} }`,
    },
    referenceAnimations: references,
    logoSting,
  };

  store.update("visualIdentity", { motionLanguage } as Partial<VisualIdentityInfo>);

  return {
    success: true,
    duration,
    easing,
    style,
    tokenCount: references.length,
  };
}
