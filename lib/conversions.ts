'use client'

import type { DailyCheckIn, EmergencyEvent, NovaUser } from './types'
import { filterByDays } from './utils'

// ─── Trigger detection logic ──────────────────────────────────────────────────
// These functions detect the right moment to surface the Masterclass nudge.
// The goal: feel like a trusted advisor noticing a pattern — not a pop-up.

export interface ConversionTrigger {
  type: string
  patternSummary: string
  priority: 'high' | 'medium'
}

export function detectConversionTrigger(
  checkIns: DailyCheckIn[],
  emergencyEvents: EmergencyEvent[],
  user?: NovaUser | null
): ConversionTrigger | null {
  // If user is in the program or has completed the reset, suppress all triggers
  // (they get in-program nudges instead — handled by the nudge API with program context)
  if (user?.inProgram) return null
  const last7 = filterByDays(checkIns, 7)
  const last14 = filterByDays(checkIns, 14)
  const cutoff7 = new Date(); cutoff7.setDate(cutoff7.getDate() - 7)
  const last7Emergency = emergencyEvents.filter(e => new Date(e.createdAt) >= cutoff7)

  // ── HIGH PRIORITY TRIGGERS ──

  // 1. Persistent tired-but-wired (3+ times in 14 days)
  const tiredWiredCount = last14.filter(c => c.aiStateLabel === 'Tired but Wired').length
  if (tiredWiredCount >= 3) {
    return {
      type: 'persistent_tired_wired',
      patternSummary: `Tired but Wired state appearing ${tiredWiredCount} times in the last 2 weeks`,
      priority: 'high',
    }
  }

  // 2. Multiple emergency events in a week (3+)
  if (last7Emergency.length >= 3) {
    const types = last7Emergency.map((e: EmergencyEvent) => e.eventType)
    const topType = types[0]?.replace(/_/g, ' ') || 'stress moments'
    return {
      type: 'frequent_emergency',
      patternSummary: `${last7Emergency.length} emergency support moments in the last 7 days, including ${topType}`,
      priority: 'high',
    }
  }

  // 3. Battery Saving Mode 4+ times in 14 days
  const compensationCount = last14.filter(c => c.aiStateLabel === 'Battery Saving Mode').length
  if (compensationCount >= 4) {
    return {
      type: 'persistent_compensation',
      patternSummary: `Battery Saving Mode detected ${compensationCount} times in the last 2 weeks`,
      priority: 'high',
    }
  }

  // ── MEDIUM PRIORITY TRIGGERS ──

  // 4. Consistently low energy average (below 5) over 7 days with enough data
  if (last7.length >= 4) {
    const avgEnergy = last7.reduce((s, c) => s + c.morningEnergy, 0) / last7.length
    if (avgEnergy < 5) {
      return {
        type: 'chronic_low_energy',
        patternSummary: `Average morning energy of ${avgEnergy.toFixed(1)}/10 over the last 7 days`,
        priority: 'medium',
      }
    }
  }

  // 5. 7-day check-in streak (engaged user, good moment to deepen)
  if (checkIns.length >= 7) {
    const streak = getStreak(checkIns)
    if (streak === 7) {
      return {
        type: 'seven_day_streak',
        patternSummary: '7-day check-in streak — consistent engagement with self-awareness',
        priority: 'medium',
      }
    }
  }

  // 6. High stress + poor sleep combo sustained (4+ days in 7)
  const stressedAndTired = last7.filter(c => c.stressPressure >= 7 && c.sleepQuality <= 5)
  if (stressedAndTired.length >= 4) {
    return {
      type: 'stress_sleep_combo',
      patternSummary: `High stress combined with poor sleep on ${stressedAndTired.length} of the last 7 days`,
      priority: 'medium',
    }
  }

  // 7. Recovery Needed appearing 3+ times in a week
  const recoveryCount = last7.filter(c => c.aiStateLabel === 'Recovery Needed').length
  if (recoveryCount >= 3) {
    return {
      type: 'persistent_recovery_needed',
      patternSummary: `Recovery Needed state on ${recoveryCount} of the last 7 days`,
      priority: 'medium',
    }
  }

  return null
}

function getStreak(checkIns: DailyCheckIn[]): number {
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    if (checkIns.find(c => c.date === dateStr)) {
      streak++
    } else if (i > 0) break
  }
  return streak
}

// ─── Dismissal storage ────────────────────────────────────────────────────────
// We only show a nudge once per trigger type. Once dismissed, it won't re-appear
// for that trigger until the type changes.

const KEY = 'nova_dismissed_nudges'

export function getDismissedNudges(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function dismissNudge(type: string): void {
  if (typeof window === 'undefined') return
  const dismissed = getDismissedNudges()
  if (!dismissed.includes(type)) {
    dismissed.push(type)
    localStorage.setItem(KEY, JSON.stringify(dismissed))
  }
}

export function isNudgeDismissed(type: string): boolean {
  return getDismissedNudges().includes(type)
}
