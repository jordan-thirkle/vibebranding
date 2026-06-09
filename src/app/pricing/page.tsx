'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PLANS } from '@/lib/stripe/admin'

type PlanTier = keyof typeof PLANS

/** Inner component that uses useSearchParams — wrapped in Suspense below */
function PricingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const checkoutStatus = searchParams.get('checkout')
  const [session, setSession] = useState<boolean | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [currentPlan, setCurrentPlan] = useState<PlanTier>('free')

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      if (!supabase) return
      supabase.auth.getUser().then(({ data: { user } }) => {
        setSession(!!user)
        if (user) {
          // Fetch current plan
          fetch('/api/stripe/plan')
            .then(r => r.json())
            .then(d => { if (d.tier) setCurrentPlan(d.tier) })
            .catch(() => {})
        }
      })
    })
  }, [])

  const handleSubscribe = async (plan: PlanTier) => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    setLoading(plan)
    setError('')
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to create checkout')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, cancel anytime.
          </p>
          {checkoutStatus === 'success' && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium" role="status">
              <span aria-hidden="true">✓</span> Welcome! Your plan has been activated.
            </div>
          )}
          {checkoutStatus === 'cancelled' && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm">
              Checkout cancelled — no changes made.
            </div>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.entries(PLANS) as [PlanTier, typeof PLANS['free']][]).map(([tier, plan]) => {
            const isCurrent = currentPlan === tier
            const isPro = tier === 'pro'
            return (
              <div
                key={tier}
                className={`relative rounded-2xl border-2 p-8 flex flex-col transition-all ${
                  isPro
                    ? 'border-blue-500 shadow-lg shadow-blue-500/10 scale-[1.02] bg-white dark:bg-zinc-900'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-xl font-bold capitalize">{plan.name}</h2>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      {tier === 'free' ? '$0' : tier === 'pro' ? '$19' : '$49'}
                    </span>
                    {tier !== 'free' && <span className="text-zinc-400 text-sm">/month</span>}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1" role="list">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="mt-0.5 text-blue-500 shrink-0" aria-hidden="true">✓</span>
                      {feature}
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="mt-0.5 text-blue-500 shrink-0" aria-hidden="true">✓</span>
                    {plan.maxBrands === -1 ? 'Unlimited brands' : `Up to ${plan.maxBrands} brands`}
                  </li>
                </ul>

                <button
                  onClick={() => handleSubscribe(tier)}
                  disabled={isCurrent || loading !== null}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all min-h-[48px] ${
                    isCurrent
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-default'
                      : isPro
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        : 'border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  {isCurrent
                    ? 'Current Plan'
                    : loading === tier
                      ? 'Redirecting...'
                      : tier === 'free'
                        ? 'Get Started'
                        : `Subscribe to ${plan.name}`}
                </button>
              </div>
            )
          })}
        </div>

        {error && (
          <div className="mt-8 max-w-md mx-auto p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400" role="alert">
            {error}
          </div>
        )}

        {/* Enterprise note */}
        <p className="mt-12 text-center text-sm text-zinc-400">
          Need a custom plan? Contact us at{' '}
          <a href="mailto:hello@vibebranding.vercel.app" className="text-blue-600 underline">
            hello@vibebranding.vercel.app
          </a>
        </p>
      </div>
    </main>
  )
}

/** Wrapper with Suspense boundary for useSearchParams */
export default function PricingPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 flex items-center justify-center p-12">
        <div className="animate-pulse text-zinc-400">Loading pricing...</div>
      </main>
    }>
      <PricingContent />
    </Suspense>
  )
}
