import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Devlog — VibeBranding',
  description: 'Thoughts on vibe coding, brand building, and AI-powered design from the VibeBranding team.',
  openGraph: {
    title: 'Devlog — VibeBranding',
    description: 'Thoughts on vibe coding, brand building, and AI-powered design from the VibeBranding team.',
    url: 'https://vibebranding.vercel.app/devlog',
    type: 'website',
  },
}

export default function DevlogPage() {
  const entries: never[] = []

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
        <header className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            Devlog
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Thoughts on vibe coding, brand building, and AI-powered design from the VibeBranding team.
          </p>
        </header>

        {entries.length > 0 ? (
          <div className="space-y-12">
            {entries.map((entry) => (
              <article key={(entry as any).slug}>
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {(entry as any).title}
                </h2>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  {(entry as any).excerpt}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-20 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              No entries yet. Check back soon for insights on vibe coding, brand identity, and AI design tools.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
