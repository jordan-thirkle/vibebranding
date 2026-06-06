'use client'

import { useState, useEffect } from 'react'

type SupabaseState = 'loading' | 'available' | 'unconfigured'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [supabaseState, setSupabaseState] = useState<SupabaseState>('loading')

  useEffect(() => {
    const url = typeof window !== 'undefined' && typeof process !== 'undefined'
      ? (process.env as Record<string, string | undefined>).NEXT_PUBLIC_SUPABASE_URL
      : undefined
    setSupabaseState(url && url !== 'placeholder' ? 'available' : 'unconfigured')
  }, [])

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (supabaseState !== 'available') return
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      if (!supabase) {
        setError('Supabase is not configured')
        setLoading(false)
        return
      }
      const { error: magicError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      if (magicError) {
        setError(magicError.message)
      } else {
        setMessage('Check your email for the magic link')
        setEmail('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize auth')
    }
    setLoading(false)
  }

  const handleGitHubLogin = async () => {
    if (supabaseState !== 'available') return
    setLoading(true)
    setError('')

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      if (!supabase) {
        setError('Supabase is not configured')
        setLoading(false)
        return
      }
      const { error: ghError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (ghError) setError(ghError.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize auth')
    }
    setLoading(false)
  }

  if (supabaseState === 'loading') {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    )
  }

  if (supabaseState === 'unconfigured') {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <div className="w-full max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Auth Coming Soon</h1>
          <p className="text-sm text-zinc-500">
            User accounts and brand persistence are not yet configured.
            Set up a Supabase project and add your keys to enable authentication.
          </p>
          <p className="mt-4 text-xs text-zinc-400">
            <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full items-center justify-center p-8">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold tracking-tight">Sign in to VibeBranding</h1>
          <p className="mt-1 text-sm text-zinc-500">Enter your email to receive a magic link</p>
        </div>

        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-400">or</span>
          </div>
        </div>

        <button
          onClick={handleGitHubLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Continue with GitHub
        </button>

        {message && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-400 text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
