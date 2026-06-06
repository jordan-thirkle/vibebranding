'use client'

import { useState } from 'react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('idle')

    try {
      const res = await fetch('https://buttondown.com/api/emails/embed-subscribe/vibebranding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, tag: 'vibebranding' }),
      })

      if (res.ok) {
        setStatus('success')
        setMessage('Thanks for subscribing!')
        setEmail('')
      } else {
        setStatus('error')
        setMessage('Something went wrong. Try again later.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Try again later.')
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Stay in the loop
      </h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Get updates on vibe coding, brand building, and AI design tools.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          Subscribe
        </button>
      </form>

      {status === 'success' && (
        <p className="mt-3 text-sm text-green-600 dark:text-green-400">{message}</p>
      )}
      {status === 'error' && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{message}</p>
      )}
    </div>
  )
}
