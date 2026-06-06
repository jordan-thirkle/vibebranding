// Brand State Object — TypeScript type definitions
// The BSO is the central data structure that all modules read from and write to.

// ─── Product ────────────────────────────────────────────────

export interface AudienceProfile {
  demographics: string;
  psychographics: string;
  techSophistication: "low" | "medium" | "high";
  ageRange?: string;
  goals?: string[];
  fears?: string[];
  aesthetics?: string[];
  language?: string[];
}

export interface Competitor {
  name: string;
  url?: string;
  notes: string;
}

export interface ProductInfo {
  name: string;
  tagline: string;
  description: string;
  category: string;
  audience: AudienceProfile;
  competitors: Competitor[];
}

// ─── Strategy ───────────────────────────────────────────────

export interface BrandArchetype {
  archetype:
    | "Hero"
    | "Creator"
    | "Explorer"
    | "Sage"
    | "Outlaw"
    | "Magician"
    | "Everyman"
    | "Lover"
    | "Jester"
    | "Caregiver"
    | "Ruler"
    | "Innocent";
  weight: number; // 0-100
  rationale: string;
}

export interface PersonalitySpectrum {
  excitingVsCalm: number; // 0 (calm) to 100 (exciting)
  modernVsClassic: number; // 0 (classic) to 100 (modern)
  playfulVsSerious: number; // 0 (serious) to 100 (playful)
  accessibleVsExclusive: number; // 0 (exclusive) to 100 (accessible)
  boldVsUnderstated: number; // 0 (understated) to 100 (bold)
}

export interface ToneOfVoice {
  formalToCasual: number; // 0 (formal) to 100 (casual)
  seriousToWitty: number; // 0 (serious) to 100 (witty)
  authoritativeToApproachable: number; // 0 (authoritative) to 100 (approachable)
  conventionalToIrreverent: number; // 0 (conventional) to 100 (irreverent)
  examples?: {
    inVoice: string;
    outOfVoice: string;
  }[];
}

export interface StrategyInfo {
  positioning: string;
  personalityArchetypes: BrandArchetype[];
  personalitySpectrum: PersonalitySpectrum;
  brandValues: string[];
  toneOfVoice: ToneOfVoice;
  emotionalTerritory: string;
}

// ─── Visual Identity ────────────────────────────────────────

export interface LogoInfo {
  typology:
    | "wordmark"
    | "lettermark"
    | "icon_wordmark"
    | "abstract_mark"
    | "combination_mark"
    | "emblem";
  concepts: LogoConcept[];
  selectedConcept?: number;
  lockups: LogoLockup[];
  qualityChecks?: LogoQualityChecks;
}

export interface LogoConcept {
  index: number;
  description: string;
  prompt: string;
  imageUrl?: string;
  rationale: string;
}

export interface LogoLockup {
  variant: "horizontal" | "stacked" | "icon_only" | "wordmark_only";
  description: string;
  geometryNotes?: string;
}

export interface LogoQualityChecks {
  legibility16px: boolean;
  oneColourReproduction: boolean;
  backgroundVersatility: boolean;
  competitorProximity: "distinct" | "similar" | "conflicting";
}

export interface ColourToken {
  name: string;
  hex: string;
  hsl: string;
  role: string;
  lightMode: string;
  darkMode: string;
}

export interface ColourSystemInfo {
  harmonyType:
    | "complementary"
    | "split_complementary"
    | "triadic"
    | "analogous"
    | "monochromatic";
  primaryColour: string; // hex
  secondaryColour: string; // hex
  accentColour: string; // hex
  neutralScale: ColourToken[]; // 50-950
  semanticColours: ColourToken[];
  surfaceColours: ColourToken[];
  textColours: ColourToken[];
  distribution: {
    primaryPercent: number; // ~60
    secondaryPercent: number; // ~30
    accentPercent: number; // ~10
  };
  wcagReport: WcagReport;
  tokens: {
    css: string;
    tailwind: string;
    scss: string;
  };
}

export interface WcagReport {
  overall: "pass" | "fail";
  checks: WcagCheck[];
}

export interface WcagCheck {
  foreground: string;
  background: string;
  contrastRatio: number;
  normalTextPass: boolean;
  largeTextPass: boolean;
}

export interface TypographyInfo {
  displayFont: FontSelection;
  textFont: FontSelection;
  monoFont?: FontSelection;
  typeScale: TypeScale;
  pairingRationale: string;
  tokens: {
    css: string;
    tailwind: string;
  };
}

export interface FontSelection {
  name: string;
  classification: string;
  source: "google" | "adobe" | "self_hosted" | "system";
  weights: number[];
  isVariable: boolean;
  fallbackStack: string;
  rationale: string;
  embedCode?: string;
}

export interface TypeScale {
  ratio: number; // e.g., 1.25
  ratioName: "major_third" | "perfect_fourth" | "augmented_fourth" | "minor_third";
  sizes: TypeScaleSize[];
}

export interface TypeScaleSize {
  name: string; // e.g., "xs", "sm", "base", "lg", etc.
  sizePx: number;
  sizeRem: number;
  lineHeight: number;
  usage: string;
}

export interface IconographyInfo {
  strokeWeight: number; // px
  cornerRadius: number; // px
  fillApproach: "outline" | "filled" | "duotone" | "illustrated";
  viewBox: number; // e.g., 24
  coreIcons: IconSpec[];
  featureIcons: IconSpec[];
  appIcon: AppIconSpec;
}

export interface IconSpec {
  name: string;
  category: string;
  description: string;
  svgPathHint?: string;
}

export interface AppIconSpec {
  description: string;
  sizes: number[];
  platformAdaptations: string;
}

export interface IllustrationStyleInfo {
  style:
    | "geometric_abstract"
    | "isometric"
    | "character"
    | "3d_material"
    | "editorial_collage"
    | "line_art_sketch";
  rationale: string;
  strokeWeight: number; // must match iconography
  sceneDescriptions: IllustrationScene[];
}

export interface IllustrationScene {
  name: string;
  purpose: "marketing" | "onboarding" | "empty_state" | "error";
  description: string;
  prompt: string;
}

export interface MotionLanguageInfo {
  personality: {
    duration: "snappy" | "quick" | "deliberate" | "languid";
    easing: "sharp" | "spring" | "smooth";
    style: "functional" | "personality_forward" | "expressive";
  };
  tokens: {
    css: string;
    js: string;
  };
  referenceAnimations: MotionReference[];
  logoSting: MotionLogoSting;
}

export interface MotionReference {
  name: string;
  description: string;
  cssKeyframes?: string;
  duration: string;
  easing: string;
}

export interface MotionLogoSting {
  entryAnimation: string;
  loopAnimation?: string;
  exitAnimation?: string;
  totalDuration: string;
}

export interface VisualIdentityInfo {
  logo: LogoInfo;
  colourSystem: ColourSystemInfo;
  typography: TypographyInfo;
  iconography: IconographyInfo;
  illustrationStyle: IllustrationStyleInfo;
  motionLanguage: MotionLanguageInfo;
}

// ─── Verbal Identity ────────────────────────────────────────

export interface NamingInfo {
  candidates: NameCandidate[];
  recommended?: number;
  selectedName?: string;
}

export interface NameCandidate {
  name: string;
  approach: "descriptive" | "evocative" | "invented" | "metaphorical" | "compound";
  rationale: string;
  scores: {
    phonetics: number;
    memorability: number;
    distinctiveness: number;
    overall: number;
  };
  availability: {
    dotCom: boolean;
    dotIo: boolean;
    dotApp: boolean;
    socialHandles: Record<string, boolean>;
  };
  trademarkRisk: "low" | "medium" | "high" | "conflict";
  negativeMeanings: string[];
}

export interface TaglineCandidate {
  text: string;
  approach: "benefit_led" | "emotion_led" | "imperative" | "question" | "positioning_condensed";
  scores: {
    memorability: number;
    originality: number;
    brandFit: number;
    searchability: number;
    internationalLegibility: number;
  };
}

export interface MessagingHierarchy {
  heroHeadline: string;
  subHeadline: string;
  bodyDescription: string;
  primaryCTA: string;
  secondaryCTA: string;
  featureHeadlines: string[];
}

export interface CopyExamples {
  toneVariations: {
    onBrand: string[];
    tooFormal: string[];
    tooCasual: string[];
  };
  microcopy: {
    buttonLabels: Record<string, string>;
    errorMessages: Record<string, string>;
    emptyStates: Record<string, string>;
    onboardingTooltips: Record<string, string>;
    successStates: Record<string, string>;
    loadingStates: Record<string, string>;
  };
  brandVocabulary: {
    ownedWords: string[];
    avoidedWords: string[];
    namingConventions: string;
  };
}

export interface VerbalIdentityInfo {
  naming: NamingInfo;
  taglines: TaglineCandidate[];
  messagingHierarchy: MessagingHierarchy;
  copyExamples: CopyExamples;
}

// ─── Assets ──────────────────────────────────────────────────

export interface AssetInfo {
  generated: GeneratedAsset[];
  exportFormats: string[];
}

export interface GeneratedAsset {
  name: string;
  type: string;
  format: string;
  path: string;
  description: string;
}

// ─── Consistency ─────────────────────────────────────────────

export interface ConsistencyCheck {
  name: string;
  status: "pass" | "warn" | "flag" | "skip";
  details: string;
  remediation?: string;
  severity: "info" | "warning" | "error";
}

export interface ConsistencyReport {
  checks: ConsistencyCheck[];
  totalChecks: number;
  passed: number;
  warnings: number;
  errors: number;
  overall: "ready" | "needs_fixes";
}

// ─── Root BSO ────────────────────────────────────────────────

export interface BrandStateObject {
  version: string;
  product: ProductInfo;
  strategy: StrategyInfo;
  visualIdentity: Partial<VisualIdentityInfo>;
  verbalIdentity: Partial<VerbalIdentityInfo>;
  assets: AssetInfo;
  consistencyReport?: ConsistencyReport;
  metadata: {
    createdAt: string;
    updatedAt: string;
    stage: number; // 1-9
    history: BsoHistoryEntry[];
  };
}

export interface BsoHistoryEntry {
  timestamp: string;
  stage: number;
  message: string;
  snapshot: Partial<BrandStateObject>;
}

// ─── Module Output ───────────────────────────────────────────

export type ModuleOutput<T> = {
  success: boolean;
  data?: T;
  errors?: string[];
};

export type BsoPartialUpdate = Partial<BrandStateObject>;
