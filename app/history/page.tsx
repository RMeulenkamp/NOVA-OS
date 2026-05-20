'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getCheckIns, getEmergencyEvents } from '@/lib/storage'
import { getAverages, filterByDays, cn, getStateLabelColor, getScoreColor, formatDate, formatTime } from '@/lib/utils'
import { TopBar, BottomNav } from '@/components/Navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { DailyCheckIn, EmergencyEvent } from '@/lib/types'
import { ScanLine, Zap, ChevronDown, ChevronUp, TrendingUp, BarChart2, Sparkles } from 'lucide-react'

type Tab = 'stats' | 'checkins' | 'emergency'
type StatPeriod = 'week' | 'month' | 'year'

interface PeriodReading {
  overallState: string
  reading: string
  keyInsight: string
  recommendation: string
  strengthSignal: string
  watchSignal: string
}

const emergencyLabels: Record<string, string> = {
  crashing: 'Energy crash', sugar_craving: 'Sugar / food craving', cant_focus: "Can't focus",
  anxious: 'Anxiety', emotionally_overwhelmed: 'Emotional overwhelm', doom_scrolling: 'Doom scrolling',
  frozen_shutdown: 'Freeze / shutdown', tired_but_wired: 'Tired but wired', irritated: 'Irritation',
  want_caffeine: 'Caffeine urge', want_to_give_up: 'Wanting to give up',
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('stats')
  const [statPeriod, setStatPeriod] = useState<StatPeriod>('week')
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([])
  const [emergencyEvents, setEmergencyEvents] = useState<EmergencyEvent[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [periodReading, setPeriodReading] = useState<PeriodReading | null>(null)
  const [loadingReading, setLoadingReading] = useState(false)

  useEffect(() => {
    if (user) {
      setCheckIns(getCheckIns().filter(c => c.userId === user.id))
      setEmergencyEvents(getEmergencyEvents().filter(e => e.userId === user.id))
    }
  }, [user])

  // Reset reading when period changes
  useEffect(() => { setPeriodReading(null) }, [statPeriod])

  const days = statPeriod === 'week' ? 7 : statPeriod === 'month' ? 30 : 365
  const periodCheckIns = filterByDays(checkIns, days)
  const avgs = getAverages(periodCheckIns)

  async function generatePeriodReading() {
    if (!avgs || !user) return
    setLoadingReading(true)
    try {
      const res = await fetch('/api/period-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: statPeriod, averages: avgs, checkInCount: avgs.count, user }),
      })
      const data = await res.json()
      setPeriodReading(data.result)
    } catch (e) { console.error(e) }
    finally { setLoadingReading(false) }
  }

  const periodLabel = statPeriod === 'week' ? '7 days' : statPeriod === 'month' ? '30 days' : '12 months'

  return (
    <div className="min-h-screen pb-24">
      <TopBar title="History & Insights" subtitle="Your patterns over time" showBack />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Tabs */}
        <div className="flex bg-nova-surface rounded-xl p-1 gap-1 border border-nova-border">
          {[
            { key: 'stats', label: 'Statistics', icon: BarChart2 },
            { key: 'checkins', label: 'Scans', icon: ScanLine },
            { key: 'emergency', label: 'Emergency', icon: Zap },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key as Tab)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200',
                activeTab === key ? 'bg-nova-card text-nova-text-bright shadow-nova-sm' : 'text-nova-dim hover:text-nova-muted'
              )}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── STATS TAB ── */}
        {activeTab === 'stats' && (
          <div className="space-y-5 animate-slide-up">
            {/* Period selector */}
            <div className="flex gap-2">
              {(['week', 'month', 'year'] as StatPeriod[]).map(p => (
                <button key={p} onClick={() => setStatPeriod(p)}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-xs font-medium border transition-all',
                    statPeriod === p
                      ? 'bg-nova-accent/15 border-nova-accent/50 text-nova-accent'
                      : 'bg-nova-surface border-nova-border text-nova-dim hover:text-nova-muted'
                  )}>
                  {p === 'week' ? 'This week' : p === 'month' ? 'This month' : 'This year'}
                </button>
              ))}
            </div>

            {avgs && avgs.count > 0 ? (
              <>
                {/* Summary line */}
                <div className="text-center">
                  <p className="text-xs text-nova-dim">{avgs.count} check-ins in the last {periodLabel}</p>
                </div>

                {/* Score averages */}
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-nova-accent" />
                    <p className="text-xs text-nova-muted uppercase tracking-wider">Average scores</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Sleep quality', value: avgs.sleepQuality, good: true },
                      { label: 'Morning energy', value: avgs.morningEnergy, good: true },
                      { label: 'Mental clarity', value: avgs.mentalClarity, good: true },
                      { label: 'Stress / pressure', value: avgs.stressPressure, good: false },
                      { label: 'Body tension', value: avgs.bodyTension, good: false },
                    ].map(({ label, value, good }) => {
                      const displayScore = good ? value : 11 - value
                      const pct = (value / 10) * 100
                      const barColor = displayScore >= 7 ? '#4de8a0' : displayScore >= 5 ? '#f5a623' : '#ef4444'
                      return (
                        <div key={label} className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-nova-muted">{label}</span>
                            <span className={cn('text-sm font-semibold', getScoreColor(displayScore))}>
                              {value}
                            </span>
                          </div>
                          <div className="h-1.5 bg-nova-border rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, backgroundColor: barColor }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>

                {/* Score cards grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: 'Sleep', value: avgs.sleepQuality, emoji: '🌙' },
                    { label: 'Energy', value: avgs.morningEnergy, emoji: '⚡' },
                    { label: 'Clarity', value: avgs.mentalClarity, emoji: '🧠' },
                  ].map(({ label, value, emoji }) => (
                    <Card key={label} className="text-center py-3">
                      <div className="text-base mb-0.5">{emoji}</div>
                      <div className={cn('text-xl font-bold', getScoreColor(value))}>{value}</div>
                      <div className="text-[10px] text-nova-dim mt-0.5">{label} avg</div>
                    </Card>
                  ))}
                </div>

                {/* AI Period Reading */}
                {!periodReading ? (
                  <Button
                    onClick={generatePeriodReading}
                    loading={loadingReading}
                    variant="secondary"
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4" />
                    {loadingReading ? 'NOVA is reading your period…' : `Get NOVA reading for this ${statPeriod}`}
                  </Button>
                ) : (
                  <div className="space-y-3 animate-slide-up">
                    {/* Overall state */}
                    <Card className="bg-nova-accent/5 border-nova-accent/25">
                      <p className="text-xs text-nova-muted uppercase tracking-wider mb-1.5">
                        NOVA reading · {periodLabel}
                      </p>
                      <p className="text-lg font-semibold text-nova-accent mb-2">
                        {periodReading.overallState}
                      </p>
                      <p className="text-sm text-nova-text leading-relaxed">{periodReading.reading}</p>
                    </Card>

                    {/* Key insight */}
                    <Card className="border-l-2 border-nova-mint">
                      <p className="text-xs text-nova-dim uppercase tracking-wider mb-1.5">Key insight</p>
                      <p className="text-sm text-nova-text leading-relaxed">{periodReading.keyInsight}</p>
                    </Card>

                    {/* Two signal cards */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <Card className="border-nova-success/25">
                        <p className="text-[10px] text-nova-success uppercase tracking-wider mb-1.5">Strength</p>
                        <p className="text-xs text-nova-text leading-relaxed">{periodReading.strengthSignal}</p>
                      </Card>
                      <Card className="border-nova-warning/25">
                        <p className="text-[10px] text-nova-warning uppercase tracking-wider mb-1.5">Watch</p>
                        <p className="text-xs text-nova-text leading-relaxed">{periodReading.watchSignal}</p>
                      </Card>
                    </div>

                    {/* Recommendation */}
                    <Card>
                      <p className="text-xs text-nova-dim uppercase tracking-wider mb-1.5">Going forward</p>
                      <p className="text-sm text-nova-text leading-relaxed">{periodReading.recommendation}</p>
                    </Card>

                    <button
                      onClick={() => setPeriodReading(null)}
                      className="w-full text-xs text-nova-dim hover:text-nova-muted transition-colors py-1"
                    >
                      Refresh reading
                    </button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={<BarChart2 className="w-6 h-6 text-nova-dim" />}
                title={`No data for the last ${periodLabel}`}
                subtitle="Complete daily check-ins to see your statistics and patterns here."
              />
            )}
          </div>
        )}

        {/* ── CHECK-INS TAB ── */}
        {activeTab === 'checkins' && (
          <div className="space-y-3 animate-slide-up">
            {checkIns.length === 0 ? (
              <EmptyState icon={<ScanLine className="w-6 h-6 text-nova-dim" />} title="No check-ins yet" subtitle="Complete your first daily scan to start seeing patterns here." />
            ) : (
              checkIns.map(checkIn => (
                <Card key={checkIn.id} className="overflow-hidden">
                  <button onClick={() => setExpanded(expanded === checkIn.id ? null : checkIn.id)} className="w-full text-left">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-nova-dim">{formatDate(checkIn.createdAt)}</p>
                        {checkIn.aiStateLabel
                          ? <p className={cn('text-sm font-semibold', getStateLabelColor(checkIn.aiStateLabel))}>{checkIn.aiStateLabel}</p>
                          : <p className="text-sm text-nova-muted">Completed</p>}
                        {checkIn.aiRecommendations && (
                          <p className="text-xs text-nova-muted leading-snug">{checkIn.aiRecommendations.todaysFocus}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          <ScoreChip label="Energy" value={checkIn.morningEnergy} />
                          <ScoreChip label="Sleep" value={checkIn.sleepQuality} />
                        </div>
                        {expanded === checkIn.id ? <ChevronUp className="w-4 h-4 text-nova-dim" /> : <ChevronDown className="w-4 h-4 text-nova-dim" />}
                      </div>
                    </div>
                  </button>
                  {expanded === checkIn.id && checkIn.aiRecommendations && (
                    <div className="mt-4 pt-4 border-t border-nova-border/50 space-y-3 animate-slide-up">
                      <div>
                        <p className="text-[10px] text-nova-dim uppercase tracking-wider mb-1.5">State reading</p>
                        <p className="text-xs text-nova-text leading-relaxed">{checkIn.aiRecommendations.stateInterpretation}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-nova-dim uppercase tracking-wider mb-1.5">Recommended actions</p>
                        <div className="space-y-1.5">
                          {checkIn.aiRecommendations.recommendedActions.map((a, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-nova-success text-xs mt-0.5">✓</span>
                              <p className="text-xs text-nova-muted leading-relaxed">{a}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-nova-accent/80 italic leading-relaxed">"{checkIn.aiRecommendations.encouragingReframe}"</p>
                      <div className="grid grid-cols-5 gap-2 pt-1">
                        {[
                          { l: 'Sleep', v: checkIn.sleepQuality }, { l: 'Energy', v: checkIn.morningEnergy },
                          { l: 'Clarity', v: checkIn.mentalClarity }, { l: 'Stress', v: checkIn.stressPressure },
                          { l: 'Tension', v: checkIn.bodyTension },
                        ].map(({ l, v }) => (
                          <div key={l} className="text-center">
                            <div className={cn('text-sm font-bold', getScoreColor(v))}>{v}</div>
                            <div className="text-[9px] text-nova-dim">{l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {/* ── EMERGENCY TAB ── */}
        {activeTab === 'emergency' && (
          <div className="space-y-3 animate-slide-up">
            {emergencyEvents.length === 0 ? (
              <EmptyState icon={<Zap className="w-6 h-6 text-nova-dim" />} title="No emergency events" subtitle="When you use the Emergency Button, events will appear here." />
            ) : (
              emergencyEvents.map(event => (
                <Card key={event.id} className="overflow-hidden">
                  <button onClick={() => setExpanded(expanded === event.id ? null : event.id)} className="w-full text-left">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-nova-dim">{formatDate(event.createdAt)} · {formatTime(event.createdAt)}</p>
                        <p className="text-sm font-semibold text-nova-text-bright">{emergencyLabels[event.eventType] || event.eventType}</p>
                        {event.triggerText && <p className="text-xs text-nova-muted">{event.triggerText}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <IntensityBadge intensity={event.intensity} />
                        {expanded === event.id ? <ChevronUp className="w-4 h-4 text-nova-dim" /> : <ChevronDown className="w-4 h-4 text-nova-dim" />}
                      </div>
                    </div>
                  </button>
                  {expanded === event.id && event.aiResponse && (
                    <div className="mt-4 pt-4 border-t border-nova-border/50 space-y-3 animate-slide-up">
                      <p className="text-xs text-nova-text leading-relaxed">{event.aiResponse.immediateValidation}</p>
                      <div>
                        <p className="text-[10px] text-nova-dim uppercase tracking-wider mb-1">60s reset</p>
                        <p className="text-xs text-nova-muted leading-relaxed">{event.aiResponse.sixtySecondReset}</p>
                      </div>
                      <p className="text-xs text-nova-accent italic">"{event.aiResponse.groundingSentence}"</p>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

function ScoreChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className={cn('text-sm font-bold', getScoreColor(value))}>{value}</div>
      <div className="text-[9px] text-nova-dim">{label}</div>
    </div>
  )
}

function IntensityBadge({ intensity }: { intensity: number }) {
  const color = intensity >= 8 ? 'text-nova-danger bg-nova-danger/10 border-nova-danger/20'
    : intensity >= 5 ? 'text-nova-warning bg-nova-warning/10 border-nova-warning/20'
    : 'text-nova-success bg-nova-success/10 border-nova-success/20'
  return <span className={cn('nova-badge', color)}>{intensity}/10</span>
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="text-center py-12 space-y-3">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-nova-surface border border-nova-border flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-sm font-medium text-nova-text-bright">{title}</p>
        <p className="text-xs text-nova-muted mt-1 max-w-xs mx-auto leading-relaxed">{subtitle}</p>
      </div>
    </div>
  )
}
