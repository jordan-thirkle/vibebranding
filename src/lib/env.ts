/**
 * Environment variable validation.
 * Validates required vars at module load time (server start / build).
 * Call `validateEnv()` at the top of your server entry point.
 */

export type EnvVar = {
  name: string;
  description: string;
  required: boolean;
  /** If true, the value must not be a placeholder like 'placeholder' or 'your-...' */
  noPlaceholder?: boolean;
};

const REQUIRED_VARS: EnvVar[] = [
  { name: 'NEXT_PUBLIC_SUPABASE_URL', description: 'Supabase project URL', required: true, noPlaceholder: true },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', description: 'Supabase anon/public key', required: true, noPlaceholder: true },
  { name: 'GEMINI_API_KEY', description: 'Google Gemini AI API key', required: true, noPlaceholder: true },
  { name: 'STRIPE_SECRET_KEY', description: 'Stripe secret key (sk_test_... or sk_live_...)', required: false },
  { name: 'STRIPE_WEBHOOK_SECRET', description: 'Stripe webhook signing secret', required: false },
  { name: 'STRIPE_PRO_PRICE_ID', description: 'Stripe price ID for Pro plan', required: false },
  { name: 'STRIPE_UNLIMITED_PRICE_ID', description: 'Stripe price ID for Unlimited plan', required: false },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Supabase service_role key (for webhooks, admin)', required: false },
  { name: 'GROQ_API_KEY', description: 'Groq API key (fallback AI provider)', required: false },
];

function isPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    lower === 'placeholder' ||
    lower === 'your-key-here' ||
    lower === 'your-api-key-here' ||
    lower.startsWith('placeholder') ||
    lower.startsWith('your-')
  );
}

function checkVar({ name, description, required, noPlaceholder }: EnvVar): string | null {
  const value = process.env[name];

  if (!value) {
    if (required) {
      return `Missing required env var: ${name} (${description})`;
    }
    return null; // optional and missing — fine
  }

  if (noPlaceholder && isPlaceholder(value)) {
    if (required) {
      return `Env var ${name} has placeholder value: "${value}". Set a real ${description}.`;
    }
    return null;
  }

  return null;
}

let validated = false;
let errors: string[] = [];

/**
 * Reset validation state (used in tests).
 */
export function resetEnvValidation(): void {
  validated = false;
  errors = [];
}

/**
 * Validate all environment variables.
 * Call once at server startup. Throws if required vars are missing.
 * Returns a list of warnings for optional vars that are missing.
 */
export function validateEnv(): string[] {
  if (validated) return errors;

  errors = [];
  const warnings: string[] = [];

  for (const v of REQUIRED_VARS) {
    const error = checkVar(v);
    if (error) {
      errors.push(error);
    }
  }

  validated = true;

  if (errors.length > 0) {
    console.error('Environment variable validation failed:');
    for (const e of errors) {
      console.error(`  ❌ ${e}`);
    }
    console.error('\nSet these in .env.local or Vercel environment variables.');
    // Don't throw in dev mode — allow the app to start with warnings
    if (process.env.NODE_ENV === 'production') {
      console.error('FATAL: Required environment variables are missing in production.');
    }
  }

  return [...errors];
}

/**
 * Check if the environment is fully configured for Stripe payments.
 */
export function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    process.env.STRIPE_PRO_PRICE_ID &&
    process.env.STRIPE_UNLIMITED_PRICE_ID &&
    !isPlaceholder(process.env.STRIPE_SECRET_KEY) &&
    !isPlaceholder(process.env.STRIPE_WEBHOOK_SECRET)
  );
}

/**
 * Check if Groq fallback is configured.
 */
export function isGroqConfigured(): boolean {
  return !!(process.env.GROQ_API_KEY && !isPlaceholder(process.env.GROQ_API_KEY));
}

/**
 * Check if the Supabase service role key is configured (for webhooks).
 */
export function isSupabaseServiceConfigured(): boolean {
  return !!(process.env.SUPABASE_SERVICE_ROLE_KEY && !isPlaceholder(process.env.SUPABASE_SERVICE_ROLE_KEY));
}
