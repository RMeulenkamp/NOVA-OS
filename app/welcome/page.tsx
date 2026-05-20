'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { createUser } from '@/lib/storage'
import { NovaLogo } from '@/components/Navigation'
import { Button } from '@/components/ui/Button'

export default function WelcomePage() {
  const [mode, setMode] = useState<'welcome' | 'signup'>('welcome')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setIsLoading(true)

    setTimeout(() => {
      const user = createUser({
        name: name.trim(),
        email: email.trim(),
        onboardingCompleted: false,
      })
      login(user)
      router.push('/onboarding')
    }, 600)
  }

  if (mode === 'signup') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm space-y-8 animate-slide-up">
          <button
            onClick={() => setMode('welcome')}
            className="text-nova-dim text-sm hover:text-nova-muted transition-colors"
          >
            ← Back
          </button>

          <div>
            <NovaLogo size="md" />
            <h2 className="text-2xl font-semibold text-nova-text-bright mt-4">
              Create your account
            </h2>
            <p className="text-nova-muted text-sm mt-2">
              Your data stays private, stored locally on your device.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="nova-label">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name"
                className="nova-input"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="nova-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="nova-input"
                required
              />
            </div>

            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
              size="lg"
            >
              Get started →
            </Button>
          </form>

          <p className="text-xs text-nova-dim text-center leading-relaxed">
            NOVA OS provides educational and behavioral support for energy, focus, and nervous system
            regulation. It is not medical advice. If you have health concerns, consult a qualified
            healthcare professional.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 text-center">
        <div className="space-y-7 animate-fade-in max-w-sm w-full">

          {/* Logo mark + brand name */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center">
              {/* Outer glow ring */}
              <div className="absolute w-28 h-28 rounded-full bg-nova-accent/8 blur-2xl" />
              <div className="absolute w-20 h-20 rounded-full bg-nova-teal/10 blur-xl" />
              <NovaLogo size="xl" />
            </div>

            {/* THE NOVA METHOD wordmark style */}
            <div className="space-y-1">
              <h1 className="text-4xl font-bold text-nova-text-bright tracking-tight">
                NOVA
              </h1>
              <p className="text-xs font-semibold tracking-[0.3em] text-nova-teal uppercase">
                Reset · Recharge · Rise
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 opacity-30">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-nova-border" />
            <div className="w-1 h-1 rounded-full bg-nova-teal" />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-nova-border" />
          </div>

          {/* Core reframe */}
          <div className="space-y-3">
            <p className="text-lg font-medium text-nova-text-bright leading-relaxed">
              You are not lazy.<br />You are not broken.
            </p>
            <p className="text-nova-muted text-sm leading-relaxed">
              Your system is protecting you. NOVA reads your daily signals, names the
              pattern, and gives you the exact support your nervous system needs — right now.
            </p>
          </div>

          {/* Three pillars */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Body', sub: 'Biology & fuel' },
              { label: 'Mind', sub: 'Patterns & pressure' },
              { label: 'System', sub: 'Nervous system' },
            ].map(({ label, sub }) => (
              <div key={label} className="p-3 rounded-xl bg-nova-surface/60 border border-nova-border/40">
                <p className="text-sm font-semibold text-nova-teal">{label}</p>
                <p className="text-[10px] text-nova-dim mt-0.5 leading-tight">{sub}</p>
              </div>
            ))}
          </div>

          {/* Proof points */}
          <div className="space-y-2 text-left">
            {[
              "Daily state scan — 2 minutes, real patterns",
              "Emergency support when you're about to crash",
              "AI coach trained in the NOVA Method framework",
            ].map((point) => (
              <div key={point} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-nova-teal mt-1.5 flex-shrink-0" />
                <p className="text-sm text-nova-muted">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-10 space-y-3 max-w-sm mx-auto w-full">
        <Button
          onClick={() => setMode('signup')}
          className="w-full"
          size="lg"
        >
          Start your reset
        </Button>
        <p className="text-xs text-nova-dim text-center">
          Free · Stored locally on your device · No tracking
        </p>
      </div>
    </div>
  )
}
