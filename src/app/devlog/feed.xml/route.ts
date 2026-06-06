export async function GET() {
  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>VibeBranding Devlog</title>
    <link>https://vibebranding.vercel.app/devlog</link>
    <description>Thoughts on vibe coding, brand building, and AI-powered design from the VibeBranding team.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://vibebranding.vercel.app/devlog/feed.xml" rel="self" type="application/rss+xml"/>
  </channel>
</rss>`
  
  return new Response(feed, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
