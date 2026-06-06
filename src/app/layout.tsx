import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import JsonLd from "@/components/JsonLd";
import Nav from "@/components/Nav";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563EB",
  colorScheme: "light dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://vibebranding.vercel.app"),
  title: {
    default: "VibeBranding — AI Brand Identity Generator",
    template: "%s | VibeBranding",
  },
  description: "Transform your product idea into a complete, production-ready brand identity — naming, visual identity, voice, and launch assets — powered by AI.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VibeBranding",
  },
  openGraph: {
    title: "VibeBranding — AI Brand Identity Generator",
    description: "Transform your product idea into a complete, production-ready brand identity — naming, visual identity, voice, and launch assets — powered by AI.",
    type: "website",
    siteName: "VibeBranding",
    url: "https://vibebranding.vercel.app",
    locale: "en_US",
    images: [{ url: "https://vibebranding.vercel.app/opengraph-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeBranding — AI Brand Identity Generator",
    description: "Transform your product idea into a complete, production-ready brand identity — naming, visual identity, voice, and launch assets — powered by AI.",
    images: ["https://vibebranding.vercel.app/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "application-name": "VibeBranding",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon-192.svg" sizes="any" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased">
        {/* Skip-to-content link for keyboard users */}
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>

        <Nav />
        <JsonLd />
        <div id="main-content" className="flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
