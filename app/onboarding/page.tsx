'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { PrimaryGoal, MainStruggle, PreferredTone, CaffeineLevel } from '@/lib/types'

const TOTAL_STEPS = 5

// ─── Step data ────────────────────────────────────────────────────────────────

const goalOptions: { value: PrimaryGoal; label: string; emoji: string }[] = [
  { value: 'stable_energy', label: 'Stable energy', emoji: '⚡' },
  { value: 'better_focus', label: 'Better focus', emoji: '🎯' },
  { value: 'less_overwhelm', label: 'Less overwhelm', emoji: '🌊' },
  { value: 'fewer_crashes', label: 'Fewer crashes', emoji: '📉' },
  { value: 'better_sleep', label: 'Better sleep', emoji: '🌙' },
  { value: 'emotional_regulation', label: 'Emotional regulation', emoji: '🧠' },
  { value: 'reduce_cravings', label: 'Reduce cravings', emoji: '🍃' },
  { value: 'sustainable_performance', label: 'Sustainable performance', emoji: '🏔️' },
]

const struggleOptions: { value: MainStruggle; label: string }[] = [
  { value: 'afternoon_crashes', label: 'Afternoon crashes' },
  { value: 'tired_but_wired', label: 'Tired but wired' },
  { value: 'brain_fog', label: 'Brain fog' },
  { value: 'cravings', label: 'Cravings' },
  { value: 'anxiety_stress', label: 'Anxiety / stress' },
  { value: 'procrastination', label: 'Procrastination' },
  { value: 'burnout_feeling', label: 'Burnout feeling' },
  { value: 'inconsistent_routines', label: 'Inconsistent routines' },
]

const toneOptions: { value: PreferredTone; label: string; desc: string }[] = [
  { value: 'direct', label: 'Direct & practical', desc: 'No fluff. Give me the action.' },
  { value: 'warm', label: 'Warm & encouraging', desc: 'Lead with support, then steps.' },
  { value: 'scientific', label: 'Scientific', desc: 'I like to understand the mechanism.' },
  { value: 'minimal', label: 'Minimal', desc: 'As short as possible.' },
]

const caffeineOptions: { value: CaffeineLevel; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low (1 cup/day)' },
  { value: 'moderate', label: 'Moderate (2-3 cups)' },
  { value: 'high', label: 'High (4+ cups)' },
]

export default function OnboardingPage() {
  const { user, updateUser } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [goal, setGoal] = useState<PrimaryGoal>('stable_energy')
  const [struggle, setStruggle] = useState<MainStruggle>('afternoon_crashes')
  const [tone, setTone] = useState<PreferredTone>('direct')
  const [caffeine, setCaffeine] = useState<CaffeineLevel>('moderate')
  const [desiredFeeling, setDesiredFeeling] = useState('')

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1)
    } else {
      finishOnboarding()
    }
  }

  function finishOnboarding() {
    updateUser({
      primaryGoal: goal,
      mainStruggle: struggle,
      preferredTone: tone,
      caffeineLevel: caffeine,
      desiredFeeling: desiredFeeling.trim() || undefined,
      onboardingCompleted: true,
    })
    router.push('/dashboard')
  }

  const progress = (step / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen flex flex-col px-5 py-8 max-w-sm mx-auto">
      {/* Progress */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center justify-between">
          <span className="text-xs text-nova-dim">
            {step === TOTAL_STEPS ? 'Last step' : `Step ${step} of ${TOTAL_STEPS}`}
          </span>
          <span className="text-xs text-nova-dim">{Math.round(progress)}%</span>
        </div>
        <div className="h-1 bg-nova-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-nova-accent-soft to-nova-teal rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Greeting */}
      {step === 1 && (
        <div className="mb-6 animate-slide-up">
          <p className="text-nova-teal text-sm font-medium mb-1">
            Welcome, {user?.name?.split(' ')[0]} 👋
          </p>
          <h2 className="text-2xl font-semibold text-nova-text-bright">
            Let's personalize your experience
          </h2>
          <p className="text-nova-muted text-sm mt-2">
            A few quick questions so NOVA can give you relevant support from day one.
          </p>
        </div>
      )}

      {/* Steps */}
      <div className="flex-1 animate-slide-up" key={step}>
        {step === 1 && (
          <StepWrapper
            title="What's your main goal?"
            subtitle="What would make the biggest difference right now?"
          >
            <div className="grid grid-cols-2 gap-2.5">
              {goalOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGoal(opt.value)}
                  className={cn(
                    'p-3.5 rounded-xl border text-left transition-all duration-200',
                    goal === opt.value
                      ? 'bg-nova-accent/15 border-nova-accent/50'
                      : 'bg-nova-surface border-nova-border hover:border-nova-accent/30'
                  )}
                >
                  <div className="text-xl mb-1.5">{opt.emoji}</div>
                  <div
                    className={cn(
                      'text-xs font-medium',
                      goal === opt.value ? 'text-nova-accent' : 'text-nova-text'
                    )}
                  >
                    {opt.label}
                  </div>
                </button>
              ))}
            </div>
          </StepWrapper>
        )}

        {step === 2 && (
          <StepWrapper
            title="What's your biggest struggle?"
            subtitle="Be honest — this helps NOVA recognize your patterns faster."
          >
            <div className="space-y-2">
              {struggleOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStruggle(opt.value)}
                  className={cn(
                    'w-full p-3.5 rounded-xl border text-left transition-all duration-200',
                    struggle === opt.value
                      ? 'bg-nova-accent/15 border-nova-accent/50 text-nova-accent'
                      : 'bg-nova-surface border-nova-border text-nova-text hover:border-nova-accent/30'
                  )}
                >
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </StepWrapper>
        )}

        {step === 3 && (
          <StepWrapper
            title="How do you prefer support?"
            subtitle="This sets the tone for all of NOVA's responses."
          >
            <div className="space-y-2.5">
              {toneOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTone(opt.value)}
                  className={cn(
                    'w-full p-4 rounded-xl border text-left transition-all duration-200',
                    tone === opt.value
                      ? 'bg-nova-accent/15 border-nova-accent/50'
                      : 'bg-nova-surface border-nova-border hover:border-nova-accent/30'
                  )}
                >
                  <div
                    className={cn(
                      'text-sm font-semibold mb-0.5',
                      tone === opt.value ? 'text-nova-accent' : 'text-nova-text-bright'
                    )}
                  >
                    {opt.label}
                  </div>
                  <div className="text-xs text-nova-dim">{opt.desc}</div>
                </button>
              ))}
            </div>
          </StepWrapper>
        )}

        {step === 4 && (
          <StepWrapper
            title="Current caffeine use?"
            subtitle="No judgment. This helps NOVA understand your nervous system baseline."
          >
            <div className="space-y-2">
              {caffeineOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCaffeine(opt.value)}
                  className={cn(
                    'w-full p-3.5 rounded-xl border text-left transition-all duration-200',
                    caffeine === opt.value
                      ? 'bg-nova-accent/15 border-nova-accent/50 text-nova-accent'
                      : 'bg-nova-surface border-nova-border text-nova-text hover:border-nova-accent/30'
                  )}
                >
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </StepWrapper>
        )}

        {step === 5 && (
          <StepWrapper
            title="One last thing"
            subtitle="Complete this sentence — in your own words."
          >
            <div className="space-y-4">
              <div className="nova-card p-4">
                <p className="text-nova-muted text-sm mb-3 italic">
                  "The way I want to feel consistently is…"
                </p>
                <textarea
                  value={desiredFeeling}
                  onChange={(e) => setDesiredFeeling(e.target.value)}
                  placeholder="e.g. calm, sharp, and steady. Present with my family and focused in my work."
                  rows={3}
                  className="nova-input resize-none text-sm"
                />
              </div>
              <p className="text-xs text-nova-dim leading-relaxed">
                This becomes your anchor. NOVA will reference it when giving you direction.
              </p>
            </div>
          </StepWrapper>
        )}
      </div>

      {/* CTA */}
      <div className="pt-6">
        <Button onClick={handleNext} className="w-full" size="lg">
          {step === TOTAL_STEPS ? 'Enter NOVA OS →' : 'Continue →'}
        </Button>
      </div>
    </div>
  )
}

function StepWrapper({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-nova-text-bright">{title}</h2>
        <p className="text-sm text-nova-muted mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}
