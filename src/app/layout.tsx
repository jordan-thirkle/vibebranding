import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VibeBranding — AI Brand Identity Generator",
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
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <head>
        <link rel="icon" href="/icon-192.svg" sizes="any" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#2563EB" />
      </head>
      <body className="h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
