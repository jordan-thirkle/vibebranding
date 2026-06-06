export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4" role="status" aria-label="Page loading">
        <div
          className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"
          aria-hidden="true"
        />
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    </main>
  );
}
