'use client'

import { useCallback, useEffect, useState } from 'react'

interface FullBrand {
  id: string
  name: string
  description: string | null
  bso: Record<string, unknown>
  stage: number
  created_at: string
  updated_at: string
}

interface BrandPreviewModalProps {
  brandId: string
  onClose: () => void
}

const STAGE_LABELS: Record<number, string> = {
  1: 'Discovery',
  2: 'Strategy',
  3: 'Naming',
  4: 'Visual',
  5: 'Logo',
  6: 'Voice',
  7: 'Assets',
  8: 'Guidelines',
  9: 'Complete',
}

function getBsoValue(bso: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, bso)
}

export default function BrandPreviewModal({ brandId, onClose }: BrandPreviewModalProps) {
  const [brand, setBrand] = useState<FullBrand | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<string>('all')
  const [exportResult, setExportResult] = useState<{ success: boolean; fileCount?: number; files?: Record<string, { filename: string; content: string }>; error?: string } | null>(null)

  const handleExport = useCallback(async () => {
    setExporting(true)
    setExportResult(null)
    try {
      const res = await fetch(`/api/brands/${brandId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: exportFormat }),
      })
      const json = await res.json()
      setExportResult(json)
      if (json.success && json.files) {
        // Download the first file automatically
        const entries = Object.entries(json.files) as [string, { filename: string; content: string }][]
        if (entries.length > 0) {
          const [, file] = entries[0]
          const blob = new Blob([file.content], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = file.filename
          a.click()
          URL.revokeObjectURL(url)
        }
      }
    } catch {
      setExportResult({ success: false, error: 'Network error' })
    } finally {
      setExporting(false)
    }
  }, [brandId, exportFormat])

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const res = await fetch(`/api/brands/${brandId}`)
        if (!res.ok) {
          setError(`Failed to load brand (${res.status})`)
          return
        }
        const json = await res.json()
        if (json.success && json.brand) {
          setBrand(json.brand)
        } else {
          setError(json.error || 'Failed to load brand')
        }
      } catch {
        setError('Network error')
      } finally {
        setLoading(false)
      }
    }
    fetchBrand()
  }, [brandId])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Prevent body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const bso = brand?.bso || {}

  // ── Extract all BSO values with proper types ──────────
  const raw = (path: string): unknown => getBsoValue(bso, path)

  // Strategy
  const emotionalTerritory = raw('strategy.emotionalTerritory') as string | undefined
  const archetypes = raw('strategy.personalityArchetypes') as Array<{ archetype: string; weight: number }> | undefined
  const toneOfVoice = raw('strategy.toneOfVoice') as Record<string, number> | undefined
  const brandValues = raw('strategy.brandValues') as string[] | undefined

  // Visual identity
  const primaryColour = raw('visualIdentity.colourSystem.primaryColour') as string | undefined
  const secondaryColour = raw('visualIdentity.colourSystem.secondaryColour') as string | undefined
  const accentColour = raw('visualIdentity.colourSystem.accentColour') as string | undefined
  const harmonyType = raw('visualIdentity.colourSystem.harmonyType') as string | undefined
  const displayFont = raw('visualIdentity.typography.displayFont') as { name: string } | undefined
  const textFont = raw('visualIdentity.typography.textFont') as { name: string } | undefined
  const monoFont = raw('visualIdentity.typography.monoFont') as { name: string } | undefined

  // Verbal identity
  const heroHeadline = raw('verbalIdentity.messagingHierarchy.heroHeadline') as string | undefined
  const primaryCTA = raw('verbalIdentity.messagingHierarchy.primaryCTA') as string | undefined
  const taglines = raw('verbalIdentity.taglines') as Array<{ text: string; scores?: Record<string, number> }> | undefined
  const nameCandidates = raw('verbalIdentity.naming.candidates') as Array<{ name: string }> | undefined

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={brand ? `${brand.name} — Brand Preview` : 'Brand Preview'}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4 rounded-t-2xl">
          <div>
            {loading ? (
              <h2 className="text-lg font-bold tracking-tight">Loading…</h2>
            ) : brand ? (
              <>
                <h2 className="text-lg font-bold tracking-tight">{brand.name}</h2>
                <p className="text-xs text-zinc-500">
                  Created {new Date(brand.created_at).toLocaleDateString()}
                </p>
              </>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close preview"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" role="status" aria-label="Loading brand data" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-5 py-4 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Brand data */}
          {brand && !loading && !error && (
            <>
              {/* Stage progress */}
              <section>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Pipeline Progress</h3>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 9 }, (_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full h-1.5 rounded-full ${
                          i < brand.stage
                            ? 'bg-blue-500'
                            : i === brand.stage - 1
                              ? 'bg-blue-300'
                              : 'bg-zinc-200 dark:bg-zinc-700'
                        }`}
                        aria-hidden="true"
                      />
                      <span className={`text-[9px] font-medium ${
                        i < brand.stage ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'
                      }`}>
                        {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  Stage {brand.stage} — {STAGE_LABELS[brand.stage] || 'Complete'}
                </p>
              </section>

              {brand.description && (
                <section>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{brand.description}</p>
                </section>
              )}

              {(archetypes || brandValues || toneOfVoice || emotionalTerritory) && (
                <section>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Brand Strategy</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {archetypes && archetypes.length > 0 && (
                      <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4">
                        <h4 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Archetypes</h4>
                        <div className="space-y-2">
                          {archetypes.map((a) => (
                            <div key={a.archetype} className="flex items-center gap-2">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="text-xs font-medium">{a.archetype}</span>
                                  <span className="text-[10px] text-zinc-500">{a.weight}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700">
                                  <div
                                    className="h-1.5 rounded-full bg-purple-500"
                                    style={{ width: `${a.weight}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {brandValues && brandValues.length > 0 && (
                      <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4">
                        <h4 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Values</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {brandValues.map((v) => (
                            <span key={v} className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-[11px]">{v}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {toneOfVoice && Object.keys(toneOfVoice).length > 0 && (
                      <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4 sm:col-span-2">
                        <h4 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Tone of Voice</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(toneOfVoice).map(([trait, value]) => (
                            <div key={trait}>
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-xs">{trait.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                                <span className="text-[10px] text-zinc-500">{Math.round(value)}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700">
                                <div
                                  className="h-1.5 rounded-full bg-blue-500"
                                  style={{ width: `${value}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {emotionalTerritory && (
                    <div className="mt-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4">
                      <h4 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">Emotional Territory</h4>
                      <p className="text-sm font-medium italic">{emotionalTerritory}</p>
                    </div>
                  )}
                </section>
              )}

              {(primaryColour || displayFont) && (
                <section>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Visual Identity</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {primaryColour && (
                      <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4">
                        <h4 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">Colour Palette</h4>
                        <div className="flex gap-3">
                          {[
                            { role: 'Primary', hex: primaryColour },
                            { role: 'Secondary', hex: secondaryColour || '#888' },
                            { role: 'Accent', hex: accentColour || '#888' },
                          ].map((c) => (
                            <div key={c.role} className="flex flex-col items-center gap-1">
                              <div
                                className="w-12 h-12 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700"
                                style={{ backgroundColor: c.hex }}
                                aria-label={`${c.role}: ${c.hex}`}
                                role="img"
                              />
                              <span className="text-[9px] text-zinc-500">{c.role}</span>
                              <span className="text-[8px] font-mono text-zinc-400">{c.hex}</span>
                            </div>
                          ))}
                        </div>
                        {harmonyType && (
                          <p className="text-[10px] text-zinc-500 mt-2 capitalize">
                            Harmony: {harmonyType.replace(/_/g, ' ')}
                          </p>
                        )}
                      </div>
                    )}

                    {displayFont && (
                      <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4">
                        <h4 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">Typography</h4>
                        {displayFont?.name && (
                          <div className="mb-2">
                            <p className="text-base font-bold">{displayFont.name}</p>
                            <p className="text-[10px] text-zinc-500">Display</p>
                          </div>
                        )}
                        {textFont?.name && (
                          <div className="mb-2">
                            <p className="text-sm">{textFont.name}</p>
                            <p className="text-[10px] text-zinc-500">Body</p>
                          </div>
                        )}
                        {monoFont?.name && (
                          <div>
                            <p className="text-xs font-mono">{monoFont.name}</p>
                            <p className="text-[10px] text-zinc-500">Code</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {(heroHeadline || taglines || nameCandidates) && (
                <section>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Verbal Identity</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {heroHeadline && (
                      <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4">
                        <h4 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Messaging</h4>
                        <p className="text-sm font-bold italic mb-1">
                          &ldquo;{heroHeadline}&rdquo;
                        </p>
                        {primaryCTA && (
                          <span className="inline-block mt-1 px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold">
                            {primaryCTA}
                          </span>
                        )}
                      </div>
                    )}

                    {taglines && taglines.length > 0 && (
                      <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4">
                        <h4 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Taglines</h4>
                        <div className="space-y-1.5">
                          {taglines.slice(0, 4).map((t) => (
                            <div key={t.text} className="flex items-center gap-2 text-xs">
                              <span className="text-zinc-700 dark:text-zinc-300">&ldquo;{t.text}&rdquo;</span>
                              {t.scores?.memorability && (
                                <span className="text-[9px] text-zinc-400 ml-auto">{t.scores.memorability}/10</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {nameCandidates && nameCandidates.length > 0 && (
                    <div className="mt-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4">
                      <h4 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Name Candidates</h4>
                      <div className="flex flex-wrap gap-2">
                        {nameCandidates.slice(0, 6).map((c) => (
                          <span key={c.name} className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-[11px] font-medium">
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {!emotionalTerritory && !primaryColour && !heroHeadline && (
                <div className="text-center py-8 text-sm text-zinc-500">
                  Brand generation incomplete. No identity data available yet.
                </div>
              )}

              {/* Export */}
              <section className="pt-2">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Export Brand Kit</h3>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {['all', 'css', 'tailwind', 'scss', 'figma', 'html'].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => { setExportFormat(fmt); setExportResult(null) }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        exportFormat === fmt
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {fmt === 'all' ? 'All Formats' : fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                  aria-label={exporting ? 'Exporting...' : 'Export brand kit'}
                >
                  {exporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Exporting…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export
                    </>
                  )}
                </button>

                {exportResult && (
                  <div className={`mt-3 rounded-lg border px-4 py-3 text-xs ${
                    exportResult.success
                      ? 'border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                      : 'border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                  }`}>
                    {exportResult.success
                      ? `Exported ${exportResult.fileCount} file(s) successfully. Check your downloads.`
                      : exportResult.error || 'Export failed'}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
