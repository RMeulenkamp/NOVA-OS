// ─── User ────────────────────────────────────────────────────────────────────

export type PreferredTone = 'direct' | 'warm' | 'scientific' | 'minimal'
export type CaffeineLevel = 'none' | 'low' | 'moderate' | 'high'
export type PrimaryGoal =
  | 'stable_energy'
  | 'better_focus'
  | 'less_overwhelm'
  | 'fewer_crashes'
  | 'better_sleep'
  | 'emotional_regulation'
  | 'reduce_cravings'
  | 'sustainable_performance'

export type MainStruggle =
  | 'afternoon_crashes'
  | 'tired_but_wired'
  | 'brain_fog'
  | 'cravings'
  | 'anxiety_stress'
  | 'procrastination'
  | 'burnout_feeling'
  | 'inconsistent_routines'

export interface NovaUser {
  id: string
  name: string
  email: string
  createdAt: string
  onboardingCompleted: boolean
  primaryGoal?: PrimaryGoal
  mainStruggle?: MainStruggle
  preferredTone?: PreferredTone
  caffeineLevel?: CaffeineLevel
  desiredFeeling?: string
  // ── NOVA Program status ──
  masterclassCompleted?: boolean   // Has attended the free Abundant Energy Masterclass
  inProgram?: boolean              // Currently enrolled in the 7-week Abundant Energy Reset
  programWeek?: number             // Which week of the program they're on (1–7)
  energyResetCompleted?: boolean   // Has completed the full 7-week Abundant Energy Reset
  // ── Monetisation ──
  isPro?: boolean                  // Paid NOVA Pro — unlimited chat messages
  chatMessagesUsed?: number        // Messages used in the current week
  chatMessageLastReset?: string    // ISO date of the last weekly reset (Monday)
}

// ─── Daily Check-In ───────────────────────────────────────────────────────────

export type CravingLevel = 'none' | 'mild' | 'strong'
export type EmotionalState =
  | 'calm'
  | 'grounded'
  | 'motivated'
  | 'hopeful'
  | 'content'
  | 'grateful'
  | 'anxious'
  | 'overwhelmed'
  | 'stressed'
  | 'fearful'
  | 'flat_numb'
  | 'disconnected'
  | 'empty'
  | 'heavy'
  | 'sad'
  | 'lonely'
  | 'irritated'
  | 'frustrated'
  | 'resistant'
  | 'restless'
  | 'shame'
  | 'pressure'
  | 'confused'
  | 'excited'

export type FocusCapacity =
  | 'deep_focus'
  | 'light_focus'
  | 'scattered'
  | 'avoidant'
  | 'shutdown'

export type CaffeineDesire = 'none' | 'normal' | 'strong' | 'desperate'

export type StateLabel =
  | 'Stable Energy'
  | 'Battery Saving Mode'
  | 'Overstimulated'
  | 'Recovery Needed'
  | 'Freeze / Shutdown'
  | 'Blood Sugar Instability'
  | 'Emotional Overload'
  | 'Calm Focus'
  | 'Tired but Wired'
  | 'Low Capacity Day'
  | 'Regulation Before Output'

export interface DailyCheckIn {
  id: string
  userId: string
  date: string // ISO date string
  sleepQuality: number // 1-10
  morningEnergy: number // 1-10
  mentalClarity: number // 1-10
  stressPressure: number // 1-10
  bodyTension: number // 1-10
  cravings: CravingLevel
  emotionalState: EmotionalState
  focusCapacity: FocusCapacity
  caffeineDesire: CaffeineDesire
  freeText: string
  aiStateLabel?: StateLabel
  aiSummary?: string
  aiRecommendations?: AICheckInResponse
  createdAt: string
}

export interface AICheckInResponse {
  stateLabel: StateLabel
  stateInterpretation: string
  likelyPattern: string
  todaysFocus: string
  recommendedActions: string[]
  whatToAvoid: string
  encouragingReframe: string
  protocolCategory: ProtocolCategory
}

// ─── Emergency Event ──────────────────────────────────────────────────────────

export type EmergencyEventType =
  | 'crashing'
  | 'sugar_craving'
  | 'cant_focus'
  | 'anxious'
  | 'emotionally_overwhelmed'
  | 'doom_scrolling'
  | 'frozen_shutdown'
  | 'tired_but_wired'
  | 'irritated'
  | 'want_caffeine'
  | 'want_to_give_up'

export interface EmergencyEvent {
  id: string
  userId: string
  date: string
  eventType: EmergencyEventType
  intensity: number // 1-10
  triggerText?: string
  aiPattern?: string
  aiResponse?: AIEmergencyResponse
  createdAt: string
}

export interface AIEmergencyResponse {
  immediateValidation: string
  patternInterpretation: string
  sixtySecondReset: string
  threeMinuteNextStep: string
  whatNotToDo: string
  groundingSentence: string
}

// ─── Chat Message ─────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  userId: string
  role: MessageRole
  content: string
  createdAt: string
}

// ─── Protocol ────────────────────────────────────────────────────────────────

export type ProtocolCategory =
  | 'Stabilize'
  | 'Activate'
  | 'Recover'
  | 'Focus'
  | 'Regulate'
  | 'Simplify'
  | 'Nourish'
  | 'Sleep Support'

export interface AdaptiveProtocol {
  category: ProtocolCategory
  why: string
  priority: string
  doList: string[]
  avoidList: string[]
}

// ─── User Insight ─────────────────────────────────────────────────────────────

export type InsightType = 'pattern' | 'win' | 'trend' | 'recommendation'

export interface UserInsight {
  id: string
  userId: string
  insightType: InsightType
  insightText: string
  createdAt: string
}

// ─── App State ────────────────────────────────────────────────────────────────

export interface AppState {
  user: NovaUser | null
  checkIns: DailyCheckIn[]
  emergencyEvents: EmergencyEvent[]
  chatMessages: ChatMessage[]
  insights: UserInsight[]
}
