'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { saveCheckIn, generateId, getTodayCheckIn } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { TopBar, BottomNav } from '@/components/Navigation'
import { ScoreSlider, OptionSelector } from '@/components/ui/ScoreSlider'
import { Button } from '@/components/ui/Button'
import { StateResult } from '@/components/scanner/StateResult'
import type {
  DailyCheckIn,
  CravingLevel,
  EmotionalState,
  FocusCapacity,
  CaffeineDesire,
  AICheckInResponse,
} from '@/lib/types'

const TOTAL_STEPS = 4

export default function ScannerPage() {
  const { user } = useAuth()
  const router = useRouter()

  const todayCheckIn = getTodayCheckIn()

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AICheckInResponse | null>(
    todayCheckIn?.aiRecommendations || null
  )
  const [checkInData, setCheckInData] = useState<DailyCheckIn | null>(todayCheckIn || null)

  // Form state
  const [sleepQuality, setSleepQuality] = useState(6)
  const [morningEnergy, setMorningEnergy] = useState(5)
  const [mentalClarity, setMentalClarity] = useState(6)
  const [stressPressure, setStressPressure] = useState(5)
  const [bodyTension, setBodyTension] = useState(4)
  const [cravings, setCravings] = useState<CravingLevel>('none')
  const [emotionalState, setEmotionalState] = useState<EmotionalState>('calm')
  const [focusCapacity, setFocusCapacity] = useState<FocusCapacity>('light_focus')
  const [caffeineDesire, setCaffeineDesire] = useState<CaffeineDesire>('normal')
  const [freeText, setFreeText] = useState('')

  // If already checked in today, show result
  if (result && checkInData) {
    return (
      <div className="min-h-screen pb-24">
        <TopBar title="Daily Scanner" subtitle="Today's state analysis" showBack />
        <div className="max-w-lg mx-auto px-4 py-6">
          <StateResult result={result} checkIn={checkInData} />
          <div className="mt-6">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setResult(null)
                setCheckInData(null)
                setStep(1)
              }}
            >
              Re-scan today
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  async function handleSubmit() {
    if (!user) return
    setIsLoading(true)

    const newCheckIn: DailyCheckIn = {
      id: generateId(),
      userId: user.id,
      date: new Date().toISOString().split('T')[0],
      sleepQuality,
      morningEnergy,
      mentalClarity,
      stressPressure,
      bodyTension,
      cravings,
      emotionalState,
      focusCapacity,
      caffeineDesire,
      freeText,
      createdAt: new Date().toISOString(),
    }

    try {
      const res = await fetch('/api/scanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkIn: newCheckIn, user }),
      })
      const data = await res.json()

      const aiResult: AICheckInResponse = data.result
      const completedCheckIn: DailyCheckIn = {
        ...newCheckIn,
        aiStateLabel: aiResult.stateLabel,
        aiSummary: aiResult.stateInterpretation,
        aiRecommendations: aiResult,
      }

      saveCheckIn(completedCheckIn)
      setCheckInData(completedCheckIn)
      setResult(aiResult)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const progress = (step / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen pb-24">
      <TopBar
        title="Daily Scanner"
        subtitle="2-minute morning check-in"
        showBack
      />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-nova-dim">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-nova-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-nova-accent-soft to-nova-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step 1: Energy scores */}
        {step === 1 && (
          <div className="space-y-8 animate-slide-up">
            <div>
              <h2 className="nova-section-title">Physical state</h2>
              <p className="nova-section-subtitle">Rate from 1 (very low) to 10 (excellent)</p>
            </div>
            <ScoreSlider label="Sleep quality" hint="How well did you sleep?" value={sleepQuality} onChange={setSleepQuality} />
            <ScoreSlider label="Morning energy" hint="How does your energy feel right now?" value={morningEnergy} onChange={setMorningEnergy} />
            <ScoreSlider label="Mental clarity" hint="How sharp / clear does your mind feel?" value={mentalClarity} onChange={setMentalClarity} />
            <ScoreSlider label="Stress / pressure" hint="How much pressure is your system holding?" value={stressPressure} onChange={setStressPressure} />
            <ScoreSlider label="Body tension" hint="Physical tightness, restlessness, or fatigue?" value={bodyTension} onChange={setBodyTension} />
          </div>
        )}

        {/* Step 2: Emotional state */}
        {step === 2 && (
          <div className="space-y-8 animate-slide-up">
            <div>
              <h2 className="nova-section-title">Emotional & inner state</h2>
              <p className="nova-section-subtitle">Be honest — no emotion is wrong. Select the one that's most true right now.</p>
            </div>

            <div>
              <span className="text-sm font-medium text-nova-text">Cravings</span>
              <p className="text-xs text-nova-dim mt-0.5 mb-3">
                This refers to any pull toward food, sugar, caffeine, stimulation, or comfort — even subtle urges. Cravings are often signals of stress, low blood sugar, or nervous system dysregulation, not lack of willpower.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'none', label: 'None', desc: 'No pull toward anything' },
                  { value: 'mild', label: 'Mild', desc: 'Slight urge, easy to ignore' },
                  { value: 'strong', label: 'Strong', desc: 'Hard to resist right now' },
                ] as { value: CravingLevel; label: string; desc: string }[]).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCravings(opt.value)}
                    className={cn(
                      'p-3 rounded-xl border text-left transition-all duration-200',
                      cravings === opt.value
                        ? 'bg-nova-accent/15 border-nova-accent/50'
                        : 'bg-nova-surface border-nova-border hover:border-nova-accent/30'
                    )}
                  >
                    <div className={cn('text-xs font-semibold mb-0.5', cravings === opt.value ? 'text-nova-accent' : 'text-nova-text-bright')}>{opt.label}</div>
                    <div className="text-[10px] text-nova-dim leading-tight">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-nova-text">Emotional state</span>
              <p className="text-xs text-nova-dim mt-0.5 mb-3">Select the word that feels closest. One is enough.</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  // Positive / regulated
                  { value: 'calm', label: 'Calm', group: 'up' },
                  { value: 'grounded', label: 'Grounded', group: 'up' },
                  { value: 'motivated', label: 'Motivated', group: 'up' },
                  { value: 'hopeful', label: 'Hopeful', group: 'up' },
                  { value: 'content', label: 'Content', group: 'up' },
                  { value: 'grateful', label: 'Grateful', group: 'up' },
                  { value: 'excited', label: 'Excited', group: 'up' },
                  // Activated / stressed
                  { value: 'anxious', label: 'Anxious', group: 'stress' },
                  { value: 'overwhelmed', label: 'Overwhelmed', group: 'stress' },
                  { value: 'stressed', label: 'Stressed', group: 'stress' },
                  { value: 'fearful', label: 'Fearful', group: 'stress' },
                  { value: 'restless', label: 'Restless', group: 'stress' },
                  { value: 'pressure', label: 'Under pressure', group: 'stress' },
                  // Low / down
                  { value: 'flat_numb', label: 'Flat / Numb', group: 'down' },
                  { value: 'disconnected', label: 'Disconnected', group: 'down' },
                  { value: 'empty', label: 'Empty', group: 'down' },
                  { value: 'heavy', label: 'Heavy', group: 'down' },
                  { value: 'sad', label: 'Sad', group: 'down' },
                  { value: 'lonely', label: 'Lonely', group: 'down' },
                  // Friction
                  { value: 'irritated', label: 'Irritated', group: 'friction' },
                  { value: 'frustrated', label: 'Frustrated', group: 'friction' },
                  { value: 'resistant', label: 'Resistant', group: 'friction' },
                  { value: 'shame', label: 'Shame', group: 'friction' },
                  { value: 'confused', label: 'Confused', group: 'friction' },
                ] as { value: EmotionalState; label: string; group: string }[]).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEmotionalState(opt.value)}
                    className={cn(
                      'px-3 py-2.5 rounded-xl text-xs font-medium border transition-all duration-200 text-center',
                      emotionalState === opt.value
                        ? 'bg-nova-accent/15 border-nova-accent/50 text-nova-accent'
                        : 'bg-nova-surface border-nova-border text-nova-muted hover:border-nova-accent/30 hover:text-nova-text'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Focus & caffeine */}
        {step === 3 && (
          <div className="space-y-8 animate-slide-up">
            <div>
              <h2 className="nova-section-title">Focus & energy signals</h2>
              <p className="nova-section-subtitle">Be honest — this is just data, not judgment.</p>
            </div>

            <OptionSelector
              label="Focus capacity right now"
              options={[
                { value: 'deep_focus', label: 'Deep focus' },
                { value: 'light_focus', label: 'Light focus' },
                { value: 'scattered', label: 'Scattered' },
                { value: 'avoidant', label: 'Avoidant' },
                { value: 'shutdown', label: 'Shutdown' },
              ]}
              value={focusCapacity}
              onChange={(v: FocusCapacity) => setFocusCapacity(v)}
              columns={3}
            />

            <OptionSelector
              label="Caffeine desire"
              options={[
                { value: 'none', label: 'None' },
                { value: 'normal', label: 'Normal' },
                { value: 'strong', label: 'Strong' },
                { value: 'desperate', label: 'Desperate' },
              ]}
              value={caffeineDesire}
              onChange={(v: CaffeineDesire) => setCaffeineDesire(v)}
              columns={2}
            />
          </div>
        )}

        {/* Step 4: Free text */}
        {step === 4 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h2 className="nova-section-title">One last signal</h2>
              <p className="nova-section-subtitle">Optional — but often the most useful data point.</p>
            </div>

            <div>
              <label className="nova-label">What feels most present today?</label>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="e.g. I woke up anxious, big call this afternoon… or I slept great but feel foggy…"
                rows={4}
                className="nova-input resize-none text-sm"
              />
              <p className="text-xs text-nova-dim mt-2">
                Could be a feeling, a situation, or just a word. NOVA uses this to give you more relevant guidance.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          {step > 1 && (
            <Button
              variant="secondary"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1"
            >
              ← Back
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button onClick={() => setStep((s) => s + 1)} className="flex-1">
              Continue →
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Reading your state…' : 'Analyze my state →'}
            </Button>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
