export default function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'VibeBranding',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    description: 'AI-driven brand identity generation platform for vibe-coded products, indie apps, SaaS tools, and developer-built projects.',
    url: 'https://vibebranding.vercel.app',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    author: {
      '@type': 'Person',
      name: 'Jordan Thirkle',
    },
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
