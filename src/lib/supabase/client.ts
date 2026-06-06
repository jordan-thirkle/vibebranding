import { createBrowserClient } from "@supabase/ssr";

/**
 * Create a Supabase client for browser usage.
 * Returns null if Supabase is not configured (placeholder/missing env vars).
 * This avoids build-time crashes when static prerendering auth pages.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check for unconfigured or placeholder values
  if (
    !url ||
    !anonKey ||
    url === "placeholder" ||
    url === "https://placeholder.supabase.co" ||
    anonKey === "placeholder-anon-key"
  ) {
    return null;
  }

  return createBrowserClient(url, anonKey);
}
