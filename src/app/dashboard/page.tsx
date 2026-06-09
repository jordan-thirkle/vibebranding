'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import BrandCard from '@/components/BrandCard'
import BrandSkeleton from '@/components/BrandSkeleton'
import ErrorBoundary from '@/components/ErrorBoundary'
import BrandPreviewModal from '@/components/BrandPreviewModal'

// ─── Types ───────────────────────────────────────────────────

interface Brand {
  id: string
  name: string
  description: string | null
  stage: number
  created_at: string
  updated_at: string
}

type SortKey = 'name' | 'updated_at' | 'stage' | 'created_at'
type SortDir = 'asc' | 'desc'

// ─── Constants ───────────────────────────────────────────────

const STAGES = [
  { num: 0, label: 'All Stages' },
  { num: 1, label: 'Discovery' },
  { num: 2, label: 'Strategy' },
  { num: 3, label: 'Naming' },
  { num: 4, label: 'Visual' },
  { num: 5, label: 'Logo' },
  { num: 6, label: 'Voice' },
  { num: 7, label: 'Assets' },
  { num: 8, label: 'Guidelines' },
  { num: 9, label: 'Complete' },
]

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'updated_at', label: 'Last Updated' },
  { key: 'name', label: 'Name' },
  { key: 'stage', label: 'Stage' },
  { key: 'created_at', label: 'Created' },
]

// ─── Component ───────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<boolean | null>(null)
  const [configError, setConfigError] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Search, filter, sort state
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState(0)
  const [sortKey, setSortKey] = useState<SortKey>('updated_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Preview modal state
  const [previewId, setPreviewId] = useState<string | null>(null)

  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetch('/api/brands')
      if (!res.ok) {
        setFetchError(`Failed to load brands (${res.status})`)
        return
      }
      const json = await res.json()
      if (json.success) setBrands(json.brands)
      else setFetchError(json.error || 'Failed to load brands')
    } catch {
      setFetchError('Network error — please check your connection and try again')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
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
  }, [fetchBrands, router])

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    if (!supabase) return
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  // ── Compute filtered + sorted brands ─────────────────────
  const filteredBrands = useMemo(() => {
    let list = [...brands]

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((b) =>
        b.name.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q))
      )
    }

    // Stage filter
    if (stageFilter > 0) {
      list = list.filter((b) => b.stage === stageFilter)
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') {
        cmp = a.name.localeCompare(b.name)
      } else if (sortKey === 'stage') {
        cmp = a.stage - b.stage
      } else if (sortKey === 'created_at' || sortKey === 'updated_at') {
        cmp = new Date(a[sortKey]).getTime() - new Date(b[sortKey]).getTime()
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [brands, searchQuery, stageFilter, sortKey, sortDir])

  // ── Render helpers ────────────────────────────────────────

  const toggleSortDir = () => {
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
  }

  if (configError) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <div className="w-full max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm text-center" role="status">
          <div className="text-4xl mb-4" aria-hidden="true">🔐</div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Dashboard Not Available</h1>
          <p className="text-sm text-zinc-500">
            User accounts and brand persistence require Supabase configuration.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 min-h-[44px] px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Back to Brand Generator
          </button>
        </div>
      </div>
    )
  }

  if (session === null || loading) {
    return (
      <div className="flex min-h-full flex-col" role="status" aria-label="Loading brands">
        <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4">
          <div className="h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </header>
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, i) => (
                <BrandSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4">
        <h1 className="text-lg font-bold tracking-tight hidden sm:block">VibeBranding</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-zinc-500 mr-2 hidden sm:inline">
            {filteredBrands.length} / {brands.length} brands
          </span>
          <button
            onClick={() => router.push('/')}
            className="min-h-[44px] px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            New Brand
          </button>
          <button
            onClick={handleSignOut}
            className="min-h-[44px] px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Search + Filter + Sort bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brands…"
              aria-label="Search brands"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Stage filter */}
          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
            {STAGES.map((s) => (
              <button
                key={s.num}
                onClick={() => setStageFilter(s.num)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px] ${
                  stageFilter === s.num
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="sort-select" className="text-xs text-zinc-500 hidden sm:block">Sort:</label>
            <select
              id="sort-select"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="px-2 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Sort brands"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={toggleSortDir}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              aria-label={sortDir === 'asc' ? 'Sort descending' : 'Sort ascending'}
            >
              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {sortDir === 'asc' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h5" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h9" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Error banner */}
        {fetchError && (
          <div className="mb-6 max-w-5xl mx-auto" role="status">
            <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-5 py-4 text-sm text-red-700 dark:text-red-400">
              <p><strong>Error:</strong> {fetchError}</p>
              <button
                onClick={() => { setFetchError(null); setLoading(true); fetchBrands() }}
                className="mt-2 text-sm font-medium underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* No results: never generated */}
        {brands.length === 0 && !fetchError && (
          <div className="flex flex-col items-center justify-center py-24 text-center vb-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2">No brands yet</h2>
            <p className="text-sm text-zinc-500 mb-6 max-w-sm">
              Your generated brand identities will appear here. Create your first brand to get started.
            </p>
            <button
              onClick={() => router.push('/')}
              className="min-h-[44px] px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
            >
              Create Your First Brand
            </button>
          </div>
        )}

        {/* No results matching filters */}
        {brands.length > 0 && filteredBrands.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold tracking-tight mb-1">No matching brands</h2>
            <p className="text-sm text-zinc-500 mb-4">
              Try adjusting your search or filter.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setStageFilter(0) }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Brand grid */}
        {filteredBrands.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ErrorBoundary>
                {filteredBrands.map((brand) => (
                  <BrandCard
                    key={brand.id}
                    brand={brand}
                    onClick={() => setPreviewId(brand.id)}
                    onDelete={() => fetchBrands()}
                  />
                ))}
              </ErrorBoundary>
            </div>
          </div>
        )}
      </main>

      {/* Preview Modal */}
      {previewId && (
        <BrandPreviewModal
          brandId={previewId}
          onClose={() => setPreviewId(null)}
        />
      )}
    </div>
  )
}
