import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Create a Supabase client for server-side usage (App Router).
 * Uses the anon key with cookie-based auth (scoped to the requesting user).
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

/**
 * Create a Supabase client with the service_role key for admin operations.
 * Use ONLY in webhook handlers, cron jobs, and admin routes where no
 * authenticated user session exists (e.g., Stripe webhooks).
 *
 * WARNING: This bypasses RLS — use sparingly and NEVER expose to clients.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey || serviceKey === 'placeholder' || serviceKey === 'your-service-role-key') {
    return null
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
