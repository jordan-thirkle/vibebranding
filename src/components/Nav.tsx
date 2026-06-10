'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

interface PlanInfo {
  tier: string
  maxBrands: number
  brandCount: number
  canCreate: boolean
  isUnlimited: boolean
}

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/brand', label: 'Brand Identity' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/devlog', label: 'Devlog' },
  { href: '/dashboard', label: 'Dashboard' },
]

export default function Nav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [plan, setPlan] = useState<PlanInfo | null>(null)
  const [user, setUser] = useState<boolean | null>(null) // null = loading, true/false = authed

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // Check auth and fetch plan info
  useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        if (!supabase) { setUser(false); return }
        const { data: { user: u } } = await supabase.auth.getUser()
        if (cancelled) return
        if (!u) { setUser(false); return }
        setUser(true)

        // Fetch plan info
        const res = await fetch('/api/stripe/plan')
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setPlan(data)
        }
      } catch {
        if (!cancelled) setUser(false)
      }
    }
    check()
    return () => { cancelled = true }
  }, [])

  const needsUpgrade = plan && !plan.canCreate
  const showBrandCount = plan && user && (plan.brandCount > 0 || !plan.canCreate)

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold tracking-tight text-blue-600 dark:text-blue-400 min-h-[44px]"
          aria-label="VibeBranding home"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.7" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.4" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.7" />
          </svg>
          VibeBranding
        </Link>

        <div className="flex items-center gap-1">
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`min-h-[44px] flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Plan indicator / upgrade CTA */}
          {showBrandCount && (
            <Link
              href="/pricing"
              className={`ml-2 min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                needsUpgrade
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
              aria-label={needsUpgrade ? 'Brand limit reached — upgrade your plan' : `${plan!.brandCount} of ${plan!.maxBrands} brands used`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                {needsUpgrade ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                )}
              </svg>
              {needsUpgrade ? (
                <>Limit reached — Upgrade</>
              ) : (
                <>{plan!.brandCount}/{plan!.isUnlimited ? '∞' : plan!.maxBrands}</>
              )}
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden ml-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {menuOpen ? (
                <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile overlay panel */}
      {menuOpen && (
        <div className="fixed inset-0 top-14 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-1 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-4 pb-6 pt-4 shadow-lg">
            {/* Plan indicator in mobile */}
            {showBrandCount && (
              <Link
                href="/pricing"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
                  needsUpgrade
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                    : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <span className="text-xs">
                  {needsUpgrade
                    ? '⚠️ Limit reached — upgrade plan'
                    : `${plan!.brandCount} / ${plan!.isUnlimited ? '∞' : plan!.maxBrands} brands used`
                  }
                </span>
                <span className="ml-auto text-xs font-semibold underline">Upgrade</span>
              </Link>
            )}
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`min-h-[44px] flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
