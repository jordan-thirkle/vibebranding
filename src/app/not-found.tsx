import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found | VibeBranding",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md text-center">
        {/* Large 404 visual */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
            <span className="text-4xl font-bold text-zinc-300 dark:text-zinc-600">404</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-3">
          Page not found
        </h1>
        <p className="text-zinc-500 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Generate a brand identity
          </Link>
          <Link
            href="/brand"
            className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            See our brand identity
          </Link>
        </div>
      </div>
    </main>
  );
}
