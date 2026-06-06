/**
 * Validation Library for VibeBranding.
 *
 * Input validators for:
 * - Domain availability checking patterns
 * - URL validation
 * - Social handle patterns
 * - Trademark risk heuristics
 * - Negative meaning cross-reference (basic)
 */

// ─── Domain Validation ───────────────────────────────────────

export function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
  return domainRegex.test(domain.toLowerCase());
}

export function domainAvailabilityPatterns(domain: string): string[] {
  const tlds = [".com", ".io", ".app", ".dev", ".co", ".ai"];
  return tlds.map((tld) => domain.toLowerCase() + tld);
}

// ─── URL Validation ──────────────────────────────────────────

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ─── Social Handle Validation ────────────────────────────────

const SOCIAL_PATTERNS: Record<string, RegExp> = {
  twitter: /^[a-zA-Z0-9_]{1,15}$/,
  github: /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/,
  instagram: /^[a-zA-Z0-9._]{1,30}$/,
  linkedin: /^[a-zA-Z0-9-]{3,100}$/,
};

export function isValidSocialHandle(platform: string, handle: string): boolean {
  const pattern = SOCIAL_PATTERNS[platform.toLowerCase()];
  if (!pattern) return false;
  return pattern.test(handle);
}

export function getSocialHandleUrls(name: string): Record<string, string> {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return {
    twitter: `https://twitter.com/${clean}`,
    github: `https://github.com/${clean}`,
    instagram: `https://instagram.com/${clean}`,
    linkedin: `https://linkedin.com/company/${clean}`,
  };
}

// ─── Trademark Risk Heuristics ────────────────────────────────

const HIGH_RISK_WORDS = [
  "apple", "google", "microsoft", "amazon", "facebook", "meta",
  "netflix", "spotify", "uber", "airbnb", "tesla", "nike",
  "coca-cola", "pepsi", "mcdonald", "starbucks", "disney",
];

export function assessTrademarkRisk(name: string): {
  risk: "low" | "medium" | "high" | "conflict";
  conflicts: string[];
} {
  const conflicts: string[] = [];
  const lowerName = name.toLowerCase();

  for (const risky of HIGH_RISK_WORDS) {
    if (lowerName.includes(risky) || risky.includes(lowerName)) {
      conflicts.push(risky);
    }
  }

  if (conflicts.length > 0) return { risk: "conflict", conflicts };
  if (name.length <= 3) return { risk: "high", conflicts: [] }; // Short names are harder to trademark
  if (lowerName.split(" ").some((w) => w.length <= 2)) return { risk: "medium", conflicts: [] };

  return { risk: "low", conflicts: [] };
}

// ─── Phonetic Analyzer ───────────────────────────────────────

export function analyzePhonetics(name: string): {
  syllables: number;
  rhythm: string;
  pronounceability: number; // 1-10
  score: number; // 1-10
} {
  // Simple syllable counter based on vowel groups
  const vowels = name.match(/[aeiouy]+/gi);
  const syllables = vowels ? vowels.length : 1;

  // Rhythm pattern
  const rhythmPattern = name
    .toLowerCase()
    .split("")
    .map((c) => ("aeiou".includes(c) ? "˘" : "¯"))
    .join("");

  // Pronounceability: penalize consecutive consonants > 2
  const consonantClusters = (name.match(/[^aeiou]{3,}/gi) || []).length;
  const pronounceability = Math.max(1, 10 - consonantClusters * 2 - (syllables > 5 ? 2 : 0));

  // Overall score
  const idealSyllables = syllables >= 2 && syllables <= 3;
  const score = Math.round(
    (pronounceability * (idealSyllables ? 1 : 0.7)) / 1
  );

  return {
    syllables,
    rhythm: rhythmPattern,
    pronounceability: Math.min(10, pronounceability),
    score: Math.min(10, Math.max(1, score)),
  };
}

// ─── Negative Meaning Cross-Reference ─────────────────────────

// Words that have negative meanings in common languages
const NEGATIVE_MEANINGS: Record<string, string[]> = {
  // Format: [word] → [language: meaning]
  barf: ["English: vomit"],
  kaka: ["Spanish: poop", "Swedish: cake (confusing)"],
  mist: ["German: manure"],
  fart: ["English: flatulence"],
  slut: ["Swedish: end/finish (innocent in Swedish, NOT in English)"],
  prick: ["English: insult", "Swedish: dot/point (innocent in Swedish)"],
};

export function checkNegativeMeanings(name: string): string[] {
  const issues: string[] = [];
  const lower = name.toLowerCase();

  for (const [word, meanings] of Object.entries(NEGATIVE_MEANINGS)) {
    if (lower.includes(word)) {
      issues.push(`"${word}" — ${meanings.join(", ")}`);
    }
  }

  return issues;
}

// ─── Memorability Scorer ─────────────────────────────────────

export function scoreMemorability(name: string): number {
  let score = 5;

  // Length: 4-8 chars is ideal
  if (name.length >= 4 && name.length <= 8) score += 2;
  else if (name.length > 12) score -= 1;

  // Uniqueness: avoid generic words
  const genericWords = ["app", "hub", "lab", "kit", "tool", "studio"];
  if (genericWords.some((w) => name.toLowerCase().includes(w))) score -= 1;

  // Repeated letters are memorable
  const hasRepeatedConsonants = /([^aeiou])\1/i.test(name);
  if (hasRepeatedConsonants) score += 1;

  // Alliteration is memorable
  const hasAlliteration = /^([a-z])[^a-z]*\1/i.test(name);
  if (hasAlliteration) score += 1;

  return Math.max(1, Math.min(10, score));
}
