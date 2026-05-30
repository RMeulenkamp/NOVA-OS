'use client'

import { v4 as uuidv4 } from 'uuid'
import type {
  NovaUser,
  DailyCheckIn,
  EmergencyEvent,
  ChatMessage,
  UserInsight,
} from './types'
import { syncUser, syncCheckIn, syncEmergencyEvent } from './sync'

// ─── Keys ─────────────────────────────────────────────────────────────────────

const KEYS = {
  USER: 'nova_user',
  CHECK_INS: 'nova_checkins',
  EMERGENCY_EVENTS: 'nova_emergency_events',
  CHAT_MESSAGES: 'nova_chat_messages',
  INSIGHTS: 'nova_insights',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function get<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

function getOne<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function generateId(): string {
  return uuidv4()
}

// ─── User ─────────────────────────────────────────────────────────────────────

export function getUser(): NovaUser | null {
  return getOne<NovaUser>(KEYS.USER)
}

export function saveUser(user: NovaUser): void {
  set(KEYS.USER, user)
  syncUser(user) // background sync to Supabase
}

export function clearUser(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEYS.USER)
}

export function createUser(data: Omit<NovaUser, 'id' | 'createdAt'>): NovaUser {
  const user: NovaUser = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  saveUser(user)
  return user
}

// ─── Daily Check-Ins ──────────────────────────────────────────────────────────

export function getCheckIns(): DailyCheckIn[] {
  const all = get<DailyCheckIn>(KEYS.CHECK_INS)
  return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getCheckInById(id: string): DailyCheckIn | undefined {
  return get<DailyCheckIn>(KEYS.CHECK_INS).find((c) => c.id === id)
}

export function getTodayCheckIn(): DailyCheckIn | undefined {
  const today = new Date().toISOString().split('T')[0]
  return get<DailyCheckIn>(KEYS.CHECK_INS).find((c) => c.date === today)
}

export function saveCheckIn(checkIn: DailyCheckIn): void {
  const all = get<DailyCheckIn>(KEYS.CHECK_INS)
  const existingIndex = all.findIndex((c) => c.id === checkIn.id)
  if (existingIndex >= 0) {
    all[existingIndex] = checkIn
  } else {
    all.push(checkIn)
  }
  set(KEYS.CHECK_INS, all)
  syncCheckIn(checkIn) // background sync to Supabase
}

// ─── Emergency Events ─────────────────────────────────────────────────────────

export function getEmergencyEvents(): EmergencyEvent[] {
  const all = get<EmergencyEvent>(KEYS.EMERGENCY_EVENTS)
  return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function saveEmergencyEvent(event: EmergencyEvent): void {
  const all = get<EmergencyEvent>(KEYS.EMERGENCY_EVENTS)
  const existingIndex = all.findIndex((e) => e.id === event.id)
  if (existingIndex >= 0) {
    all[existingIndex] = event
  } else {
    all.push(event)
  }
  set(KEYS.EMERGENCY_EVENTS, all)
  syncEmergencyEvent(event) // background sync to Supabase
}

// ─── Chat Messages ────────────────────────────────────────────────────────────

export function getChatMessages(): ChatMessage[] {
  return get<ChatMessage>(KEYS.CHAT_MESSAGES)
}

export function saveChatMessage(message: ChatMessage): void {
  const all = get<ChatMessage>(KEYS.CHAT_MESSAGES)
  all.push(message)
  set(KEYS.CHAT_MESSAGES, all)
}

export function clearChatHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEYS.CHAT_MESSAGES)
}

// ─── Insights ────────────────────────────────────────────────────────────────

export function getInsights(): UserInsight[] {
  return get<UserInsight>(KEYS.INSIGHTS)
}

export function saveInsight(insight: UserInsight): void {
  const all = get<UserInsight>(KEYS.INSIGHTS)
  all.push(insight)
  set(KEYS.INSIGHTS, all)
}

// ─── Analytics helpers ────────────────────────────────────────────────────────

export function getCheckInStreak(): number {
  const checkIns = getCheckIns()
  if (checkIns.length === 0) return 0

  let streak = 0
  const today = new Date()

  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const found = checkIns.find((c) => c.date === dateStr)
    if (found) {
      streak++
    } else if (i > 0) {
      break
    }
  }

  return streak
}

export function getWeeklyCheckInCount(): number {
  const checkIns = getCheckIns()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return checkIns.filter((c) => new Date(c.createdAt) >= sevenDaysAgo).length
}

export function getRecentPattern(): string | null {
  const checkIns = getCheckIns().slice(0, 7)
  if (checkIns.length < 3) return null

  // Find most common state label
  const labels = checkIns
    .filter((c) => c.aiStateLabel)
    .map((c) => c.aiStateLabel!)

  if (labels.length === 0) return null

  const counts = labels.reduce(
    (acc, label) => {
      acc[label] = (acc[label] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  if (mostCommon[1] >= 2) {
    return `You've been in ${mostCommon[0]} mode ${mostCommon[1]} of the last ${labels.length} days.`
  }

  return null
}

// ─── Chat message limits (free tier) ─────────────────────────────────────────

const FREE_MESSAGES_PER_WEEK = 10

/** Returns the ISO date string for the most recent Monday (weekly reset anchor) */
function getMondayDate(): string {
  const d = new Date()
  const day = d.getDay() // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day // adjust to Monday
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

/**
 * Returns how many free messages the user has used this week.
 * Resets automatically when a new Monday is detected.
 */
export function getChatMessagesUsedThisWeek(user: NovaUser): number {
  const monday = getMondayDate()
  // If last reset was before this Monday, counter resets to 0
  if (!user.chatMessageLastReset || user.chatMessageLastReset < monday) return 0
  return user.chatMessagesUsed ?? 0
}

/** Returns remaining free messages this week (always 999 for Pro users) */
export function getChatMessagesRemaining(user: NovaUser): number {
  if (user.isPro) return 999
  return Math.max(0, FREE_MESSAGES_PER_WEEK - getChatMessagesUsedThisWeek(user))
}

/** Increments the weekly chat counter. Call this after a message is sent. */
export function incrementChatMessages(user: NovaUser): NovaUser {
  const monday = getMondayDate()
  const usedThisWeek = getChatMessagesUsedThisWeek(user)
  const updated: NovaUser = {
    ...user,
    chatMessagesUsed: usedThisWeek + 1,
    chatMessageLastReset: monday,
  }
  saveUser(updated)
  return updated
}

// ─── Clear all data ───────────────────────────────────────────────────────────

export function clearAllData(): void {
  if (typeof window === 'undefined') return
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
}
