/**
 * Loading skeleton for brand cards — shown while the dashboard loads.
 * Matches the BrandCard layout exactly for a smooth transition.
 */
export default function BrandSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden animate-pulse">
      {/* Colour swatch bar skeleton */}
      <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />

      <div className="p-5 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Description lines */}
        <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Progress dots */}
        <div className="flex gap-1 pt-1">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      </div>
    </div>
  );
}
