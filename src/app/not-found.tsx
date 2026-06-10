import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full items-center justify-center p-8">
      <div className="w-full max-w-sm text-center">
        <div className="text-6xl font-bold tracking-tight text-zinc-200 dark:text-zinc-800 mb-4 select-none">
          404
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">Page not found</h1>
        <p className="text-sm text-zinc-500 mb-8">
          This page doesn&apos;t exist or has been moved. The brand you&apos;re looking
          for may have been deleted or the link might be incorrect.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="min-h-[44px] inline-flex items-center px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
          >
            Generate a Brand
          </Link>
          <Link
            href="/dashboard"
            className="min-h-[44px] inline-flex items-center px-6 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
