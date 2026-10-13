'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BarChart2, Check, Lock } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { generateId, saveMethodCheckIn, getMethodCheckIns, pullMethodCheckInsFromSupabase } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { TopBar, BottomNav } from '@/components/Navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MethodCircle } from '@/components/method/MethodCircle'
import { ChipGroup } from '@/components/method/ChipGroup'
import { ScaleInput } from '@/components/method/ScaleInput'
import { PracticePlayer } from '@/components/method/PracticePlayer'
import { practiceName } from '@/lib/practices'
import {
  METHOD_NAME,
  METHOD_PATH,
  STEPS,
  EMPTY_DRAFT,
  nextStep,
  DRAIN_OPTIONS,
  RESOLUTION_OPTIONS,
  THOUGHT_OPTIONS,
  EMOTION_OPTIONS,
  BODY_OPTIONS,
  ATTENTION_OPTIONS,
  PATTERN_OPTIONS,
  REGULATE_STATES,
  REGULATE_TARGETS,
  BEHAVIOUR_OPTIONS,
  QUICK_RELEASE_OPTIONS,
  deriveCurrentState,
  PRESENCE_OPTIONS,
  RELEASE_TYPES,
  RELEASE_ACTIONS,
  RELEASE_HINTS,
  REWIRE_GROUPS,
  recommendRegulation,
  recommendRelease,
  recommendRewire,
  buildSummary,
} from '@/lib/method'
import type { MethodDraft, Option, RewireKey } from '@/lib/method'
import type {
  MethodCheckIn,
  MethodStep,
  PresenceLevel,
  RegulateState,
  RegulateTarget,
  ResetResolution,
} from '@/lib/types'

type Screen = 'entry' | 'snapshot' | 'quick' | MethodStep | 'finish' | 'done'

const REWIRE_FIELD = {
  state: 'rewireState',
  belief: 'rewireBelief',
  identity: 'rewireIdentity',
  response: 'rewireResponse',
  focus: 'rewireFocus',
} as const

// ─── Small presentational helpers ─────────────────────────────────────────────

function ShiftRow({
  label,
  before,
  after,
  goodHigh,
}: {
  label: string
  before?: number
  after?: number
  goodHigh: boolean
}) {
  const hasBoth = before != null && after != null
  const diff = hasBoth ? (after as number) - (before as number) : 0
  const improved = goodHigh ? diff > 0 : diff < 0
  const worse = goodHigh ? diff < 0 : diff > 0
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-nova-muted">{label}</span>
      <div className="flex items-center gap-3 text-sm">
        {before != null && <span className="text-nova-dim">{before}</span>}
        {before != null && after != null && <span className="text-nova-dim">→</span>}
        {after != null && <span className="font-semibold text-nova-text-bright">{after}</span>}
        {hasBoth && diff !== 0 && (
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              improved && 'bg-emerald-500/15 text-emerald-300',
              worse && 'bg-amber-500/15 text-amber-300'
            )}
          >
            {diff > 0 ? '+' : '−'}
            {Math.abs(diff)}
          </span>
        )}
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2.5 border-b border-nova-border/50 last:border-0">
      <p className="text-[10px] uppercase tracking-wider text-nova-dim">{label}</p>
      <p className="text-sm text-nova-text-bright mt-0.5 leading-relaxed">{value}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MethodPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [screen, setScreen] = useState<Screen>('entry')
  const [draft, setDraft] = useState<MethodDraft>(EMPTY_DRAFT)
  const [startAt, setStartAt] = useState<MethodStep>('reset')
  const [saved, setSaved] = useState<MethodCheckIn | null>(null)

  const [showPause, setShowPause] = useState(false)
  const [recIndex, setRecIndex] = useState(0)
  const [afterOpen, setAfterOpen] = useState(false)
  const [forceShake, setForceShake] = useState(false)
  const [rewireTab, setRewireTab] = useState<RewireKey>('state')
  const [showStatePicker, setShowStatePicker] = useState(false)
  const [guidedCount, setGuidedCount] = useState(0)

  // Quick Compass unlocks after about 5 guided check-ins
  useEffect(() => {
    if (!user) return
    const count = () =>
      getMethodCheckIns().filter((c) => c.userId === user.id && c.mode !== 'quick').length
    setGuidedCount(count())
    pullMethodCheckInsFromSupabase(user.id).then(() => setGuidedCount(count()))
  }, [user])

  if (isLoading || !user) return null

  const isMember = !!(user.inProgram || user.energyResetCompleted)
  if (!isMember) {
    return (
      <div className="min-h-screen pb-28">
        <TopBar title={METHOD_NAME} showBack backHref="/member-hub" />
        <div className="max-w-lg mx-auto px-4 py-10 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-nova-accent/10 border border-nova-accent/20 flex items-center justify-center">
            <Lock className="w-6 h-6 text-nova-accent" />
          </div>
          <p className="text-sm text-nova-muted leading-relaxed">
            {METHOD_NAME} is part of the Abundant Energy Reset. It opens when you join the program.
          </p>
          <Link href="/member-hub" className="text-sm text-nova-accent hover:underline">
            Back to Member Hub
          </Link>
        </div>
        <BottomNav />
      </div>
    )
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  function patch(p: Partial<MethodDraft>) {
    setDraft((d) => ({ ...d, ...p }))
  }

  function scrollTop() {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
  }

  function go(step: MethodStep) {
    setDraft((d) => (d.stepsVisited.includes(step) ? d : { ...d, stepsVisited: [...d.stepsVisited, step] }))
    setScreen(step)
    scrollTop()
  }

  function toFinish() {
    setScreen('finish')
    scrollTop()
  }

  function advance(from: MethodStep) {
    const n = nextStep(from)
    if (n) go(n)
    else toFinish()
  }

  function markPractice(slug: string) {
    setDraft((d) => (d.practicesUsed.includes(slug) ? d : { ...d, practicesUsed: [...d.practicesUsed, slug] }))
  }

  function resetRegulate() {
    setRecIndex(0)
    setAfterOpen(false)
    setForceShake(false)
  }

  function chooseState(st: RegulateState) {
    patch({ state: st, presence: undefined, tensionAfterPractice: undefined })
    resetRegulate()
  }

  function chooseTarget(t: string | undefined) {
    patch({ target: t as RegulateTarget | undefined, presence: undefined, tensionAfterPractice: undefined })
    resetRegulate()
  }

  // Only claim a regulate state if they actually went through Regulate
  function finalDraft(): MethodDraft {
    return draft.stepsVisited.includes('regulate') ? { ...draft, state: currentState } : draft
  }

  function startQuick() {
    setDraft(EMPTY_DRAFT)
    setScreen('quick')
    scrollTop()
  }

  function saveQuick() {
    if (!user) return
    const now = new Date().toISOString()
    const entry: MethodCheckIn = {
      ...draft,
      mode: 'quick',
      stepsVisited: ['reset', 'realize', 'regulate', 'release', 'rewire'],
      id: generateId(),
      userId: user.id,
      date: now.split('T')[0],
      createdAt: now,
      completedAt: now,
    }
    saveMethodCheckIn(entry)
    setSaved(entry)
    setScreen('done')
    scrollTop()
  }

  function save() {
    if (!user) return
    const now = new Date().toISOString()
    const entry: MethodCheckIn = {
      ...finalDraft(),
      mode: 'guided',
      id: generateId(),
      userId: user.id,
      date: now.split('T')[0],
      createdAt: now,
      completedAt: now,
    }
    saveMethodCheckIn(entry)
    setGuidedCount((c) => c + 1)
    setSaved(entry)
    setScreen('done')
    scrollTop()
  }

  function restart() {
    setDraft({ ...EMPTY_DRAFT, energyBefore: saved?.energyAfter, tensionBefore: saved?.tensionAfter })
    setSaved(null)
    resetRegulate()
    setShowPause(false)
    setRewireTab('state')
    setStartAt('reset')
    setScreen('snapshot')
    scrollTop()
  }

  const header = (step: MethodStep, question: string, hint?: string) => {
    const idx = STEPS.findIndex((s) => s.id === step)
    const meta = STEPS[idx]
    return (
      <div className="space-y-4">
        <MethodCircle current={step} visited={draft.stepsVisited} onSelect={go} />
        <div className="text-center space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-nova-teal">
            {idx + 1} · {meta.label} · {meta.plain}
          </p>
          <h2 className="text-lg font-semibold text-nova-text-bright leading-snug">{question}</h2>
          {hint && <p className="text-xs text-nova-dim">{hint}</p>}
        </div>
      </div>
    )
  }

  const question = (text: string, hint?: string) => (
    <div className="mb-3">
      <p className="text-sm font-medium text-nova-text-bright">{text}</p>
      {hint && <p className="text-xs text-nova-dim mt-0.5">{hint}</p>}
    </div>
  )

  const noticeGroup = (label: string, options: Option[], key: 'thoughts' | 'emotions' | 'body' | 'attention' | 'behaviour') => (
    <div key={key} className="space-y-2">
      <p className="text-[11px] uppercase tracking-wider text-nova-dim">{label}</p>
      <ChipGroup
        options={options}
        selected={draft[key]}
        onChange={(v) => patch({ [key]: v } as Partial<MethodDraft>)}
      />
    </div>
  )

  // ── derived values per step ────────────────────────────────────────────────

  // Regulate (hybrid): where you are is read from the snapshot, you choose where to go
  const derivedState = deriveCurrentState(draft.energyBefore, draft.tensionBefore, draft.attention)
  const currentState: RegulateState | undefined = draft.state ?? derivedState ?? undefined
  const currentMeta = REGULATE_STATES.find((st) => st.id === currentState)
  const baseRecs = recommendRegulation(currentState, draft.target, draft.tensionBefore)
  const recs =
    forceShake && baseRecs[0] !== 'shake-for-sanity'
      ? ['shake-for-sanity', ...baseRecs.filter((x) => x !== 'shake-for-sanity')]
      : baseRecs
  const currentRec = recs.length ? recs[recIndex % recs.length] : null
  const showRecommendation = !!currentState && !!draft.target
  const steadyNoTarget = currentState === 'balanced' && !draft.target
  const canContinueRegulate = steadyNoTarget || (afterOpen && !!draft.presence && draft.presence !== 'no')
  const quickRecs = recommendRegulation(undefined, draft.target, undefined)

  // Release
  const noRelease = draft.releaseTypes.includes('r_nothing')
  const releaseRecs = recommendRelease(draft.releaseTypes, draft.releaseActions, draft.pattern)

  // Rewire
  const rewireSel: Record<RewireKey, string[]> = {
    state: draft.rewireState,
    belief: draft.rewireBelief,
    identity: draft.rewireIdentity,
    response: draft.rewireResponse,
    focus: draft.rewireFocus,
  }
  const rewireRecs = recommendRewire(rewireSel)
  const activeRewire = REWIRE_GROUPS.find((g) => g.key === rewireTab) ?? REWIRE_GROUPS[0]

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pb-28">
      <TopBar
        title={METHOD_NAME}
        subtitle="What do you need right now?"
        showBack
        backHref="/member-hub"
        rightAction={
          <Link
            href={`${METHOD_PATH}/history`}
            aria-label="Your progress"
            className="w-8 h-8 rounded-lg bg-nova-surface border border-nova-border flex items-center justify-center text-nova-muted hover:text-nova-text transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
          </Link>
        }
      />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* ── ENTRY ───────────────────────────────────────────────────────── */}
        {screen === 'entry' && (
          <div className="space-y-6 text-center animate-fade-in">
            <div>
              <h1 className="text-2xl font-semibold text-nova-text-bright">{METHOD_NAME}</h1>
              <p className="text-sm text-nova-muted mt-2 max-w-xs mx-auto leading-relaxed">
                Take a moment to check in with your system and discover what you need right now.
              </p>
            </div>

            <MethodCircle
              large
              onSelect={(s) => {
                setStartAt(s)
                setScreen('snapshot')
              }}
            />
            <p className="text-xs text-nova-dim">Tap a step to start there, or begin at the top.</p>

            {guidedCount >= 5 && (
              <Card className="border-nova-teal/30 text-left space-y-2">
                <p className="text-sm font-semibold text-nova-text-bright">You know the five questions now</p>
                <p className="text-xs text-nova-muted leading-relaxed">
                  Try running them in your head first. Or use the 60-second version here.
                </p>
                <Button variant="secondary" size="sm" className="w-full" onClick={startQuick}>
                  Quick {METHOD_NAME}
                </Button>
              </Card>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                setStartAt('reset')
                setScreen('snapshot')
              }}
            >
              START
            </Button>
            <p className="text-xs text-nova-dim leading-relaxed">
              You don't need to complete every step. Let the method show you what needs attention.
            </p>
          </div>
        )}

        {/* ── SNAPSHOT ────────────────────────────────────────────────────── */}
        {screen === 'snapshot' && (
          <div className="space-y-7 animate-slide-up">
            <div>
              <h2 className="text-lg font-semibold text-nova-text-bright">Quick snapshot</h2>
              <p className="text-xs text-nova-dim mt-1">Takes 10 seconds. It lets you see your shift at the end.</p>
            </div>

            <ScaleInput
              label="How is your energy right now?"
              value={draft.energyBefore}
              onChange={(n) => patch({ energyBefore: n })}
              lowLabel="1 · completely drained"
              highLabel="10 · alive"
            />
            <ScaleInput
              label="How contracted do you feel?"
              value={draft.tensionBefore}
              onChange={(n) => patch({ tensionBefore: n })}
              goodHigh={false}
              lowLabel="1 · expanded"
              highLabel="10 · very contracted"
            />

            <div>
              {question('What is happening right now?', 'Optional. One sentence is plenty.')}
              <textarea
                rows={2}
                value={draft.situation ?? ''}
                onChange={(e) => patch({ situation: e.target.value })}
                placeholder="e.g. I just got a difficult message from a client."
                className="nova-input resize-none text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={() => go(startAt)}>Continue →</Button>
              <Button variant="ghost" onClick={() => go(startAt)}>
                Skip the snapshot
              </Button>
            </div>
          </div>
        )}

        {/* ── 1 · RESET ───────────────────────────────────────────────────── */}
        {screen === 'reset' && (
          <div className="space-y-6 animate-slide-up">
            {header('reset', 'What is taking your energy right now?', 'Pick everything that applies.')}

            <ChipGroup
              options={DRAIN_OPTIONS}
              selected={draft.drains}
              onChange={(v) => patch({ drains: v })}
              exclusiveId="nothing"
            />

            <div>
              {question('Is there something you can close, remove, decide, schedule or simplify right now?')}
              <ChipGroup
                single
                options={RESOLUTION_OPTIONS}
                selected={draft.resetResolution ? [draft.resetResolution] : []}
                onChange={(v) => patch({ resetResolution: v[0] as ResetResolution | undefined })}
              />
            </div>

            {(draft.resetResolution === 'know' || draft.resetResolution === 'maybe') && (
              <Card className="space-y-4 border-nova-accent/30">
                <p className="text-sm font-semibold text-nova-text-bright">Take action now</p>
                <PracticePlayer slug="open-loop-reset" onDone={() => markPractice('open-loop-reset')} />
                <div>
                  <p className="text-xs text-nova-muted mb-2">
                    What is the one next action? Close it, schedule it, decide it, or drop it.
                  </p>
                  <input
                    type="text"
                    value={draft.resetAction ?? ''}
                    onChange={(e) => patch({ resetAction: e.target.value })}
                    placeholder="My one next action is…"
                    className="nova-input text-sm"
                  />
                </div>
              </Card>
            )}

            {draft.drains.includes('physical') && (
              <Card className="border-nova-teal/30">
                <p className="text-sm text-nova-text">
                  A physical drain can be worked on through your metabolic reset.{' '}
                  <Link href="/member-hub?tab=program" className="text-nova-accent hover:underline">
                    Open the Program Guide
                  </Link>
                </p>
              </Card>
            )}

            <div className="flex flex-col gap-2">
              <Button onClick={() => go('realize')}>Continue →</Button>
              {(draft.resetResolution === 'know' || draft.resetResolution === 'maybe') && (
                <Button variant="secondary" onClick={toFinish}>
                  I feel clear enough to continue my day
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ── 2 · REALIZE ─────────────────────────────────────────────────── */}
        {screen === 'realize' && (
          <div className="space-y-6 animate-slide-up">
            {header('realize', 'What are you noticing inside?', 'Tap what fits. Skip any group that does not.')}

            {noticeGroup('Thoughts', THOUGHT_OPTIONS, 'thoughts')}
            {noticeGroup('Emotions', EMOTION_OPTIONS, 'emotions')}
            {noticeGroup('Body', BODY_OPTIONS, 'body')}
            {noticeGroup('Attention', ATTENTION_OPTIONS, 'attention')}
            {noticeGroup('Behaviour', BEHAVIOUR_OPTIONS, 'behaviour')}

            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-wider text-nova-dim">Pattern</p>
              <ChipGroup
                single
                options={PATTERN_OPTIONS}
                selected={draft.pattern ? [draft.pattern] : []}
                onChange={(v) => patch({ pattern: v[0] })}
              />
            </div>

            <div>
              {question('What seems to be underneath this?', 'Optional.')}
              <textarea
                rows={2}
                value={draft.underneath ?? ''}
                onChange={(e) => patch({ underneath: e.target.value })}
                placeholder="e.g. I'm afraid I'm going to disappoint someone."
                className="nova-input resize-none text-sm"
              />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowPause((v) => !v)}
                className="text-xs text-nova-accent hover:underline"
              >
                {showPause ? 'Hide the pause practice' : 'Want a quick pause first? Try the Expand Breath'}
              </button>
              {showPause && <PracticePlayer slug="expand-breath" onDone={() => markPractice('expand-breath')} />}
              <p className="text-xs text-nova-dim">
                Want the bigger picture of your day?{' '}
                <Link href="/scanner" className="text-nova-accent hover:underline">
                  Take the Daily Scan
                </Link>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={() => go('regulate')}>Continue →</Button>
              <Button variant="secondary" onClick={() => go('rewire')}>
                I noticed it and it already settled. Take me to Rewire
              </Button>
            </div>
          </div>
        )}

        {/* ── 3 · REGULATE ────────────────────────────────────────────────── */}
        {screen === 'regulate' && (
          <div className="space-y-6 animate-slide-up">
            {header('regulate', 'What state would serve you now?', 'Move from where you are toward where you want to be.')}

            <Card className="space-y-3">
              <p className="text-[10px] uppercase tracking-wider text-nova-dim">Where you are now</p>
              {currentMeta && !showStatePicker ? (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-nova-text-bright">{currentMeta.label}</p>
                    <p className="text-xs text-nova-dim mt-0.5">{currentMeta.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowStatePicker(true)}
                    className="text-xs text-nova-accent hover:underline flex-shrink-0"
                  >
                    Not quite?
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-nova-muted">Which fits best right now?</p>
                  {REGULATE_STATES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        chooseState(st.id)
                        setShowStatePicker(false)
                      }}
                      className={cn(
                        'w-full text-left p-3 rounded-xl border transition-all duration-200',
                        currentState === st.id
                          ? 'bg-nova-accent/15 border-nova-accent/50'
                          : 'bg-nova-surface border-nova-border hover:border-nova-accent/30'
                      )}
                    >
                      <p className={cn('text-sm font-semibold', currentState === st.id ? 'text-nova-accent' : 'text-nova-text-bright')}>
                        {st.label}
                      </p>
                      <p className="text-xs text-nova-dim mt-0.5">{st.desc}</p>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            <div>
              {question('Which state would serve you now?', 'Pick where you want to move to.')}
              <ChipGroup
                single
                options={REGULATE_TARGETS}
                selected={draft.target ? [draft.target] : []}
                onChange={(v) => chooseTarget(v[0])}
              />
            </div>

            {steadyNoTarget && (
              <Card className="border-emerald-400/30 bg-emerald-500/5">
                <p className="text-sm text-nova-text">
                  You are fairly steady. You can move on, or pick a state above and use a tool to go further.
                </p>
              </Card>
            )}

            {showRecommendation && currentRec && (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-nova-teal">
                  {draft.regulationRounds > 0 ? 'Another round' : 'Try this'}
                </p>
                <PracticePlayer
                  key={`${currentRec}-${draft.regulationRounds}`}
                  slug={currentRec}
                  onDone={() => {
                    markPractice(currentRec)
                    setAfterOpen(true)
                  }}
                />

                {(draft.target === 't_energized' || currentState === 'low_energy') && recs.includes('shake-for-sanity') && (
                  <p className="text-xs text-nova-dim">
                    No room to shake? Put on a song you love and move for two or three minutes.
                  </p>
                )}

                {currentState === 'high_activation' && !forceShake && currentRec === 'regulation-breath' && (
                  <button
                    type="button"
                    onClick={() => {
                      setForceShake(true)
                      setRecIndex(0)
                      setAfterOpen(false)
                    }}
                    className="text-xs text-nova-accent hover:underline"
                  >
                    Too wound up to slow down? Start with Shake for Sanity instead
                  </button>
                )}

                {recs.length > 1 && recIndex % recs.length === 0 && (
                  <p className="text-xs text-nova-dim">
                    Next in line, if you need it: {recs.slice(1).map((x) => practiceName(x)).join(', ')}.
                  </p>
                )}
              </div>
            )}

            {afterOpen && (
              <Card className="space-y-5">
                <ScaleInput
                  label="How contracted do you feel now?"
                  value={draft.tensionAfterPractice}
                  onChange={(n) => patch({ tensionAfterPractice: n })}
                  goodHigh={false}
                  lowLabel="1 · expanded"
                  highLabel="10 · very contracted"
                />
                <div>
                  {question('Can you stay present with what is here now?')}
                  <ChipGroup
                    single
                    options={PRESENCE_OPTIONS}
                    selected={draft.presence ? [draft.presence] : []}
                    onChange={(v) => patch({ presence: v[0] as PresenceLevel | undefined })}
                  />
                </div>

                {draft.presence === 'no' && (
                  <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 p-3 space-y-3">
                    <p className="text-sm text-nova-text">
                      That is useful to know. Let's do another round instead of pushing forward.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        patch({
                          regulationRounds: draft.regulationRounds + 1,
                          presence: undefined,
                          tensionAfterPractice: undefined,
                        })
                        setRecIndex((i) => i + 1)
                        setAfterOpen(false)
                      }}
                    >
                      Another round
                    </Button>
                  </div>
                )}
              </Card>
            )}

            <div className="flex flex-col gap-2">
              <Button onClick={() => go('release')} disabled={!canContinueRegulate}>
                Continue →
              </Button>
              <Button variant="ghost" onClick={() => go('release')}>
                Skip this step
              </Button>
            </div>
          </div>
        )}

        {/* ── 4 · RELEASE ─────────────────────────────────────────────────── */}
        {screen === 'release' && (
          <div className="space-y-6 animate-slide-up">
            {header('release', 'Is something here asking to move, not be solved?', 'No release needed is a fine answer.')}

            <ChipGroup
              options={RELEASE_TYPES}
              selected={draft.releaseTypes}
              onChange={(v) => patch({ releaseTypes: v })}
              exclusiveId="r_nothing"
            />

            {noRelease && (
              <Card className="border-emerald-400/30 bg-emerald-500/5">
                <p className="text-sm text-nova-text">No release needed right now. That is a perfectly good result.</p>
              </Card>
            )}

            {!noRelease && draft.releaseTypes.length > 0 && (
              <div>
                {question('What does your body feel like doing?')}
                <ChipGroup
                  options={RELEASE_ACTIONS}
                  selected={draft.releaseActions}
                  onChange={(v) => patch({ releaseActions: v })}
                />
              </div>
            )}

            {!noRelease &&
              draft.releaseActions
                .filter((a) => RELEASE_HINTS[a])
                .map((a) => (
                  <p key={a} className="text-sm text-nova-muted leading-relaxed">
                    {RELEASE_HINTS[a]}
                  </p>
                ))}

            {releaseRecs.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-nova-teal">Try this</p>
                {releaseRecs.map((slug) => (
                  <PracticePlayer key={slug} slug={slug} onDone={() => markPractice(slug)} />
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button onClick={() => go('rewire')}>Continue →</Button>
            </div>
          </div>
        )}

        {/* ── 5 · REWIRE ──────────────────────────────────────────────────── */}
        {screen === 'rewire' && (
          <div className="space-y-6 animate-slide-up">
            {header('rewire', 'What do you want to strengthen instead?', 'Pick from any tab. One choice is enough.')}

            <div className="flex gap-1 p-1 bg-nova-surface rounded-xl border border-nova-border overflow-x-auto">
              {REWIRE_GROUPS.map((g) => {
                const count = rewireSel[g.key].length
                return (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setRewireTab(g.key)}
                    className={cn(
                      'flex-1 min-w-[64px] py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                      rewireTab === g.key ? 'bg-nova-accent text-white' : 'text-nova-muted hover:text-nova-text'
                    )}
                  >
                    {g.label}
                    {count > 0 && <span className="ml-1 text-[10px] opacity-80">·{count}</span>}
                  </button>
                )
              })}
            </div>

            <div>
              {question(activeRewire.question)}
              <ChipGroup
                options={activeRewire.options}
                selected={rewireSel[activeRewire.key]}
                onChange={(v) => patch({ [REWIRE_FIELD[activeRewire.key]]: v } as Partial<MethodDraft>)}
              />
            </div>

            {rewireRecs.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-nova-teal">Try this</p>
                {rewireRecs.map((slug) => (
                  <PracticePlayer key={slug} slug={slug} onDone={() => markPractice(slug)} />
                ))}
              </div>
            )}

            <div>
              {question('What can you do right now to strengthen it?', 'Keep it small. Then carry it into the next part of your day.')}
              <input
                type="text"
                value={draft.carryForward ?? ''}
                onChange={(e) => patch({ carryForward: e.target.value })}
                placeholder="e.g. Have the conversation without trying to control the outcome."
                className="nova-input text-sm"
              />
            </div>

            <Button className="w-full" onClick={toFinish}>
              Finish →
            </Button>
          </div>
        )}

        {/* ── QUICK COMPASS ───────────────────────────────────────────────── */}
        {screen === 'quick' && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-nova-teal">
                Quick {METHOD_NAME} · about 60 seconds
              </p>
              <h2 className="text-lg font-semibold text-nova-text-bright">Run the five questions</h2>
            </div>

            <MethodCircle />

            <Card className="space-y-6">
              <div>
                {question('1 · Reset: What is taking my energy right now?')}
                <ChipGroup
                  options={DRAIN_OPTIONS}
                  selected={draft.drains}
                  onChange={(v) => patch({ drains: v })}
                  exclusiveId="nothing"
                />
              </div>

              <div>
                {question('2 · Realize: What am I noticing underneath this?')}
                <input
                  type="text"
                  value={draft.underneath ?? ''}
                  onChange={(e) => patch({ underneath: e.target.value })}
                  placeholder="One line is plenty."
                  className="nova-input text-sm"
                />
              </div>

              <div>
                {question('3 · Regulate: What state would serve me now?', 'Then use the tool it points to.')}
                <ChipGroup
                  single
                  options={REGULATE_TARGETS}
                  selected={draft.target ? [draft.target] : []}
                  onChange={(v) => patch({ target: v[0] as RegulateTarget | undefined })}
                />
                {quickRecs.length > 0 && (
                  <p className="text-xs text-nova-teal mt-2">
                    Tool: {quickRecs.map((x) => practiceName(x)).join(' → ')}
                  </p>
                )}
              </div>

              <div>
                {question('4 · Release: Is there something I am holding that is ready to move?')}
                <ChipGroup
                  single
                  options={QUICK_RELEASE_OPTIONS}
                  selected={draft.releaseTypes}
                  onChange={(v) => patch({ releaseTypes: v })}
                />
              </div>

              <div>
                {question('5 · Rewire: What do I want to strengthen instead?')}
                <ChipGroup
                  single
                  options={REWIRE_GROUPS[0].options}
                  selected={draft.rewireState}
                  onChange={(v) => patch({ rewireState: v })}
                />
                <input
                  type="text"
                  value={draft.carryForward ?? ''}
                  onChange={(e) => patch({ carryForward: e.target.value })}
                  placeholder="What can I do right now?"
                  className="nova-input text-sm mt-3"
                />
              </div>
            </Card>

            <div className="flex flex-col gap-2">
              <Button onClick={saveQuick}>Save</Button>
              <Button variant="ghost" onClick={() => setScreen('entry')}>
                Back
              </Button>
            </div>
          </div>
        )}

        {/* ── FINISH ──────────────────────────────────────────────────────── */}
        {screen === 'finish' && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-nova-teal">Your {METHOD_NAME}</p>
              <h2 className="text-lg font-semibold text-nova-text-bright">Here is what you did</h2>
            </div>

            <Card>
              {(() => {
                const s = buildSummary(finalDraft())
                return (
                  <>
                    <SummaryRow label="You noticed" value={s.noticed} />
                    <SummaryRow label="Your system needed" value={s.needed} />
                    <SummaryRow label="You chose" value={s.chose} />
                    <SummaryRow label="You want to strengthen" value={s.strengthen} />
                    <SummaryRow label="Your next action" value={s.nextAction} />
                  </>
                )
              })()}
            </Card>

            <div className="space-y-6">
              <p className="text-sm font-semibold text-nova-text-bright">How are you now?</p>
              <ScaleInput
                label="Energy"
                value={draft.energyAfter}
                onChange={(n) => patch({ energyAfter: n })}
                lowLabel="1 · completely drained"
                highLabel="10 · alive"
              />
              <ScaleInput
                label="Contraction"
                value={draft.tensionAfter}
                onChange={(n) => patch({ tensionAfter: n })}
                goodHigh={false}
                lowLabel="1 · expanded"
                highLabel="10 · very contracted"
              />
            </div>

            <Button className="w-full" onClick={save}>
              Save my check-in
            </Button>
          </div>
        )}

        {/* ── DONE ────────────────────────────────────────────────────────── */}
        {screen === 'done' && saved && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-300" />
              </div>
              <h2 className="text-lg font-semibold text-nova-text-bright">Saved</h2>
              <p className="text-xs text-nova-dim">{saved.mode === 'quick' ? 'Quick Compass' : 'Before and after'}</p>
            </div>

            {saved.mode === 'quick' ? (
              <Card>
                <p className="text-sm text-nova-text leading-relaxed">
                  That was the whole method in about a minute. Next time, try running these five questions in your head first.
                </p>
              </Card>
            ) : (
              <Card>
                <ShiftRow label="Energy" before={saved.energyBefore} after={saved.energyAfter} goodHigh />
                <div className="border-t border-nova-border/50" />
                <ShiftRow label="Contraction" before={saved.tensionBefore} after={saved.tensionAfter} goodHigh={false} />
              </Card>
            )}

            <div className="space-y-3">
              <p className="text-sm font-semibold text-nova-text-bright text-center">Do you need another cycle?</p>
              <Button className="w-full" onClick={restart}>
                Yes, check in again
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => router.push('/member-hub')}>
                No, continue my day
              </Button>
              <Link
                href={`${METHOD_PATH}/history`}
                className="block text-center text-xs text-nova-accent hover:underline pt-1"
              >
                See your progress
              </Link>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
