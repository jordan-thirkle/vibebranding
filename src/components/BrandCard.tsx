'use client'

import { useState } from 'react'

interface BrandCardBrand {
  id: string
  name: string
  description: string | null
  stage: number
  created_at: string
  updated_at: string
}

interface BrandCardProps {
  brand: BrandCardBrand
  onClick: () => void
  onDelete: () => void
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

/** Deterministic colour from brand name for card swatch */
function nameToColour(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash % 360)
  return `hsl(${h}, 55%, 50%)`
}

function daysAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function BrandCard({ brand, onClick, onDelete }: BrandCardProps) {
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const swatchColour = nameToColour(brand.name)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    try {
      const res = await fetch(`/api/brands/${brand.id}`, { method: 'DELETE' })
      if (res.ok) {
        onDelete()
      }
    } catch {
      // Silently fail — parent will refetch
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <div
      className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`View brand: ${brand.name}`}
    >
      {/* Colour swatch bar */}
      <div className="h-2 w-full" style={{ backgroundColor: swatchColour }} aria-hidden="true" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-sm truncate pr-2">{brand.name}</h3>
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
              brand.stage >= 9
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : brand.stage >= 5
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {STAGE_LABELS[brand.stage] || `Stage ${brand.stage}`}
          </span>
        </div>

        {/* Description */}
        {brand.description && (
          <p className="text-xs text-zinc-500 line-clamp-2 mb-3 min-h-[2.5em]">
            {brand.description}
          </p>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-zinc-400">
            Updated {daysAgo(brand.updated_at)}
          </p>

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (!confirmDelete) {
                setConfirmDelete(true)
                return
              }
              handleDelete(e)
            }}
            disabled={deleting}
            className={`text-[10px] font-medium px-2 py-1 rounded-md transition-colors min-h-[28px] ${
              confirmDelete
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 focus:opacity-100'
            }`}
            aria-label={confirmDelete ? 'Confirm delete' : `Delete ${brand.name}`}
          >
            {deleting ? '…' : confirmDelete ? 'Confirm?' : 'Delete'}
          </button>
        </div>

        {/* Stage progress dots */}
        <div className="flex gap-1 mt-3" aria-label={`Progress: stage ${brand.stage} of 9`}>
          {Array.from({ length: 9 }, (_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < brand.stage
                  ? 'bg-blue-500'
                  : i === brand.stage - 1
                    ? 'bg-blue-300'
                    : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
