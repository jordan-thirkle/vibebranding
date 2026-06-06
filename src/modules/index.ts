// Branding Modules — barrel export
export { runDiscovery, runDiscoveryFromManifest } from "./discovery/index";
export type { DiscoveryInput, DiscoveryOutput } from "./discovery/index";

export { runStrategy } from "./strategy/index";
export type { StrategyOutput } from "./strategy/index";

export { runNaming } from "./naming/index";
export type { NamingOutput } from "./naming/index";

export { runColourSystem } from "./color/index";
export type { ColourOutput } from "./color/index";

export { runTypography } from "./typography/index";
export type { TypographyOutput } from "./typography/index";

export { runLogo } from "./logo/index";
export type { LogoOutput } from "./logo/index";

export { runIconography } from "./iconography/index";
export type { IconographyOutput } from "./iconography/index";

export { runMotion } from "./motion/index";
export type { MotionOutput } from "./motion/index";

export { runVerbalIdentity } from "./verbal/index";
export type { VerbalOutput } from "./verbal/index";

export { runApplications } from "./applications/index";
export type { ApplicationsOutput, ApplicationSpec } from "./applications/index";

export { runGuidelines, generateGuidelinesHTML } from "./guidelines/index";
export type { GuidelinesOutput } from "./guidelines/index";
