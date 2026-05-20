'use client'

// ─── Background Supabase sync ──────────────────────────────────────────────────
// All functions are fire-and-forget. They NEVER throw or block the UI.
// localStorage is always written first (source of truth for UX speed).
// Supabase receives the data silently in the background.
// If Supabase is not configured, all functions return immediately.

import { getSupabase } from './supabase'
import type { NovaUser, DailyCheckIn, EmergencyEvent } from './types'

function silent(label: string, fn: () => Promise<unknown>): void {
  fn().catch((e) => console.warn(`[NOVA sync] ${label} failed:`, e))
}

// ─── Sync user ────────────────────────────────────────────────────────────────

export function syncUser(user: NovaUser): void {
  const sb = getSupabase()
  if (!sb) return

  silent('user', async () =>
    sb.from('users').upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.createdAt,
      onboarding_completed: user.onboardingCompleted,
      primary_goal: user.primaryGoal ?? null,
      main_struggle: user.mainStruggle ?? null,
      preferred_tone: user.preferredTone ?? null,
      caffeine_level: user.caffeineLevel ?? null,
      desired_feeling: user.desiredFeeling ?? null,
      masterclass_completed: user.masterclassCompleted ?? false,
      in_program: user.inProgram ?? false,
      program_week: user.programWeek ?? null,
      energy_reset_completed: user.energyResetCompleted ?? false,
    })
  )
}

// ─── Sync check-in ────────────────────────────────────────────────────────────

export function syncCheckIn(checkIn: DailyCheckIn): void {
  const sb = getSupabase()
  if (!sb) return

  silent('check-in', async () =>
    sb.from('daily_check_ins').upsert({
      id: checkIn.id,
      user_id: checkIn.userId,
      date: checkIn.date,
      sleep_quality: checkIn.sleepQuality,
      morning_energy: checkIn.morningEnergy,
      mental_clarity: checkIn.mentalClarity,
      stress_pressure: checkIn.stressPressure,
      body_tension: checkIn.bodyTension,
      cravings: checkIn.cravings,
      emotional_state: checkIn.emotionalState,
      focus_capacity: checkIn.focusCapacity,
      caffeine_desire: checkIn.caffeineDesire,
      free_text: checkIn.freeText,
      ai_state_label: checkIn.aiStateLabel ?? null,
      ai_summary: checkIn.aiSummary ?? null,
      ai_recommendations: checkIn.aiRecommendations ?? null,
      created_at: checkIn.createdAt,
    })
  )
}

// ─── Sync emergency event ─────────────────────────────────────────────────────

export function syncEmergencyEvent(event: EmergencyEvent): void {
  const sb = getSupabase()
  if (!sb) return

  silent('emergency', async () =>
    sb.from('emergency_events').upsert({
      id: event.id,
      user_id: event.userId,
      date: event.date,
      event_type: event.eventType,
      intensity: event.intensity,
      trigger_text: event.triggerText ?? null,
      ai_pattern: event.aiPattern ?? null,
      ai_response: event.aiResponse ?? null,
      created_at: event.createdAt,
    })
  )
}
