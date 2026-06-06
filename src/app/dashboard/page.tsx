'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Brand {
  id: string
  name: string
  description: string | null
  stage: number
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<boolean | null>(null)
  const [configError, setConfigError] = useState(false)

  useEffect(() => {
    // Dynamic import to avoid reference at module level (which breaks static prerendering)
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      if (!supabase) {
        setConfigError(true)
        setLoading(false)
        return
      }
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) {
          router.replace('/auth/login')
          return
        }
        setSession(true)
        fetchBrands()
      })
    })
  }, [])

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/brands')
      const json = await res.json()
      if (json.success) setBrands(json.brands)
    } catch {
      // silently fail, show empty state
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    if (!supabase) return
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  if (configError) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <div className="w-full max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Dashboard Not Available</h1>
          <p className="text-sm text-zinc-500">
            User accounts and brand persistence require Supabase configuration.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Back to Brand Generator
          </button>
        </div>
      </div>
    )
  }

  if (session === null || loading) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-8 py-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight">VibeBranding</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Your Brand Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            Create New Brand
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        {brands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2">No brands yet</h2>
            <p className="text-sm text-zinc-500 mb-6 max-w-sm">
              Your generated brand identities will appear here. Create your first brand to get started.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
            >
              Create Your First Brand
            </button>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight">
                Your Brands <span className="text-sm font-normal text-zinc-400">({brands.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/brands/${brand.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-sm truncate">{brand.name}</h3>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      Stage {brand.stage}
                    </span>
                  </div>
                  {brand.description && (
                    <p className="text-xs text-zinc-500 line-clamp-2 mb-3">
                      {brand.description}
                    </p>
                  )}
                  <p className="text-[10px] text-zinc-400">
                    Updated {new Date(brand.updated_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
