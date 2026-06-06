import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface DevlogEntry {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  content: string;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry(slug);

  if (!entry) return {};

  return {
    title: `${entry.title} — VibeBranding Devlog`,
    description: entry.excerpt,
    openGraph: {
      title: `${entry.title} — VibeBranding Devlog`,
      description: entry.excerpt,
      url: `https://vibebranding.vercel.app/devlog/${slug}`,
      type: "article",
      publishedTime: entry.date,
    },
  };
}

async function getEntry(slug: string): Promise<DevlogEntry | null> {
  // TODO: Load from markdown/mdx files in a future update
  // For now, return null to show 404 until entries exist
  return null;
}

export default async function DevlogEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getEntry(slug);

  if (!entry) notFound();

  return (
    <main className="min-h-screen">
      <article className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {entry.title}
          </h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <time dateTime={entry.date}>{entry.date}</time>
            <span>by {entry.author}</span>
          </div>
        </header>
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          {entry.content}
        </div>
      </article>
    </main>
  );
}
