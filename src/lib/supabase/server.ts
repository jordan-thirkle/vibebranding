import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Create a Supabase client for server-side usage (App Router).
 * Returns null if Supabase is not configured (placeholder env vars).
 * Guards against build-time crashes when auth pages are static-rendered.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (
    !url ||
    !anonKey ||
    url === 'placeholder' ||
    url === 'https://placeholder.supabase.co' ||
    anonKey === 'placeholder-anon-key'
  ) {
    return null
  }

  const cookieStore = await cookies()
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
    },
  })
}
