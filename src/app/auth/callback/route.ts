import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const errorType = searchParams.get('error')

  // Handle OAuth errors passed back from provider
  if (errorType) {
    return NextResponse.redirect(`${origin}/auth/login?error=${errorType}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
  }

  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.redirect(`${origin}/auth/login?error=not_configured`)
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Auth callback error:', error.message)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`)
  }

  // Get the user and ensure a profile exists (for plan tracking)
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        // First login — create profile with free tier
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          plan_tier: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    }
  } catch (err) {
    // Non-critical — profile creation is best-effort
    console.warn('Profile creation skipped:', err)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
