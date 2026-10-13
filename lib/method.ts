import type {
  MethodCheckIn,
  MethodStep,
  RegulateState,
  RegulateTarget,
} from './types'
import { practiceName } from './practices'

// ─── Name (change it here and it changes everywhere) ──────────────────────────

export const METHOD_NAME = 'NOVA Compass'
export const METHOD_TAGLINE = 'What do you need right now?'
export const METHOD_PATH = '/member-hub/method'

// ─── Steps ────────────────────────────────────────────────────────────────────

export const STEPS: { id: MethodStep; label: string; plain: string }[] = [
  { id: 'reset', label: 'Reset', plain: 'Clear what is draining you' },
  { id: 'realize', label: 'Realize', plain: 'Notice what is going on inside' },
  { id: 'regulate', label: 'Regulate', plain: 'Settle or wake up your body' },
  { id: 'release', label: 'Release', plain: 'Let what is stuck move' },
  { id: 'rewire', label: 'Rewire', plain: 'Choose what you want instead' },
]

export function nextStep(current: MethodStep): MethodStep | null {
  const i = STEPS.findIndex((s) => s.id === current)
  return i >= 0 && i < STEPS.length - 1 ? STEPS[i + 1].id : null
}

// ─── Options ──────────────────────────────────────────────────────────────────
// ids are unique across ALL lists so one lookup works everywhere.

export interface Option {
  id: string
  label: string
}

export const DRAIN_OPTIONS: Option[] = [
  { id: 'open_loop', label: 'An unfinished task or open loop' },
  { id: 'decision', label: "A decision I haven't made" },
  { id: 'avoiding', label: "Something I'm avoiding" },
  { id: 'conversation', label: 'An unresolved conversation' },
  { id: 'too_many', label: 'Too many things competing for my attention' },
  { id: 'digital', label: 'Digital input or distraction' },
  { id: 'clutter', label: 'Physical or environmental clutter' },
  { id: 'physical', label: 'A physical or metabolic drain' },
  { id: 'emotional', label: 'Something deeper emotionally' },
  { id: 'other', label: 'Something else' },
  { id: 'nothing', label: 'Nothing obvious' },
]

export const RESOLUTION_OPTIONS: Option[] = [
  { id: 'know', label: 'Yes, I know what to do' },
  { id: 'maybe', label: 'Maybe, help me think about it' },
  { id: 'deeper', label: 'No, this feels deeper than an open loop' },
]

export const THOUGHT_OPTIONS: Option[] = [
  { id: 'racing', label: 'Racing thoughts' },
  { id: 'repetitive', label: 'Repetitive thinking' },
  { id: 'worry', label: 'Worry' },
  { id: 'self_critic', label: 'Self-criticism' },
  { id: 'fog', label: 'Mental fog' },
  { id: 'cant_focus', label: 'Difficulty focusing' },
]

export const EMOTION_OPTIONS: Option[] = [
  { id: 'anxiety', label: 'Anxiety / fear' },
  { id: 'anger', label: 'Anger / frustration' },
  { id: 'sadness', label: 'Sadness / grief' },
  { id: 'shame', label: 'Shame' },
  { id: 'pressure', label: 'Pressure' },
  { id: 'overwhelm', label: 'Overwhelm' },
  { id: 'other_emotion', label: 'Other' },
]

export const BODY_OPTIONS: Option[] = [
  { id: 'tight_chest', label: 'Tight chest' },
  { id: 'shallow_breath', label: 'Shallow breathing' },
  { id: 'tight_jaw', label: 'Tight jaw' },
  { id: 'tense_shoulders', label: 'Raised or tense shoulders' },
  { id: 'tight_stomach', label: 'Tight stomach' },
  { id: 'restless', label: 'Restlessness' },
  { id: 'heavy', label: 'Heaviness / fatigue' },
  { id: 'other_body', label: 'Other' },
]

export const ATTENTION_OPTIONS: Option[] = [
  { id: 'narrow', label: 'Locked onto one problem' },
  { id: 'scattered_att', label: 'Scattered' },
  { id: 'checking', label: 'Constantly checking things' },
  { id: 'not_present', label: 'Hard to stay present' },
  { id: 'spacious', label: 'Spacious and clear' },
]

export const BEHAVIOUR_OPTIONS: Option[] = [
  { id: 'b_procrastinating', label: 'Procrastinating' },
  { id: 'b_distracting', label: 'Scrolling or distracting myself' },
  { id: 'b_snapping', label: 'Snapping or withdrawing' },
  { id: 'b_pleasing', label: 'People-pleasing or over-explaining' },
  { id: 'b_pushing', label: 'Overworking or pushing harder' },
  { id: 'b_controlling', label: 'Trying to control everything' },
  { id: 'b_numbing', label: 'Numbing out' },
]

export const PATTERN_OPTIONS: Option[] = [
  { id: 'recurring', label: 'This feels familiar / recurring' },
  { id: 'today', label: 'This seems mainly about today' },
  { id: 'unsure', label: "I'm not sure" },
]

export const REGULATE_STATES: { id: RegulateState; label: string; desc: string }[] = [
  { id: 'high_activation', label: 'Wound up', desc: 'I feel stressed, anxious, tense or overwhelmed.' },
  { id: 'charged', label: 'Charged up', desc: 'I feel restless, frustrated, angry or like I need to move.' },
  { id: 'low_energy', label: 'Low and flat', desc: 'I feel flat, heavy, foggy or unmotivated.' },
  { id: 'scattered', label: 'Scattered', desc: "My attention is everywhere and I can't settle." },
  { id: 'balanced', label: 'Fairly steady', desc: 'I feel fairly grounded and able to be with what is here.' },
]

export const STATE_SHORT: Record<RegulateState, string> = {
  high_activation: 'Wound up',
  charged: 'Charged up',
  low_energy: 'Low and flat',
  scattered: 'Scattered',
  balanced: 'Steady',
}

// The expanded states a member can choose to move toward
export const REGULATE_TARGETS: { id: RegulateTarget; label: string }[] = [
  { id: 't_calm', label: 'Calm' },
  { id: 't_grounded', label: 'Grounded' },
  { id: 't_energized', label: 'Energized' },
  { id: 't_clear', label: 'Clear' },
  { id: 't_focused', label: 'Focused' },
  { id: 't_open', label: 'Open' },
  { id: 't_confident', label: 'Confident' },
  { id: 't_present', label: 'Present' },
  { id: 't_other', label: 'Something else' },
]

export const QUICK_RELEASE_OPTIONS: Option[] = [
  { id: 'q_release_yes', label: 'Yes, something wants to move' },
  { id: 'r_nothing', label: 'Nothing right now' },
]

export const PRESENCE_OPTIONS: Option[] = [
  { id: 'yes', label: 'Yes' },
  { id: 'somewhat', label: 'Somewhat' },
  { id: 'no', label: 'No, I need more calming down' },
]

export const RELEASE_TYPES: Option[] = [
  { id: 'r_anger', label: 'Anger / frustration' },
  { id: 'r_sadness', label: 'Sadness / grief' },
  { id: 'r_fear', label: 'Fear' },
  { id: 'r_shame', label: 'Shame' },
  { id: 'r_pressure', label: 'Pressure' },
  { id: 'r_tension', label: 'Physical tension' },
  { id: 'r_tears', label: 'Tears' },
  { id: 'r_unnamed', label: "Something I can feel but can't name" },
  { id: 'r_nothing', label: 'Nothing right now' },
]

export const RELEASE_ACTIONS: Option[] = [
  { id: 'a_move', label: 'Move' },
  { id: 'a_shake', label: 'Shake' },
  { id: 'a_cry', label: 'Cry' },
  { id: 'a_sigh', label: 'Sigh / breathe' },
  { id: 'a_sound', label: 'Make sound' },
  { id: 'a_journal', label: 'Write it out' },
  { id: 'a_speak', label: 'Have the conversation / talk to someone' },
  { id: 'a_stay', label: 'Stay with the feeling' },
  { id: 'a_rest', label: 'Rest' },
  { id: 'a_unknown', label: "I don't know" },
]

export const RELEASE_HINTS: Record<string, string> = {
  a_cry: 'Let the tears come. Give yourself a few quiet minutes.',
  a_sigh: 'Take a few long sighs, out loud if you can.',
  a_journal: 'Write for two minutes. No editing, no fixing.',
  a_speak: 'Reach out to someone you trust and say what is true.',
  a_rest: 'Give yourself five minutes of real rest. Nothing to solve.',
  a_stay: 'Stay with it. Notice where you feel it and let it be there, without fixing it.',
}

export type RewireKey = 'state' | 'belief' | 'identity' | 'response' | 'focus'

export const REWIRE_GROUPS: { key: RewireKey; label: string; question: string; options: Option[] }[] = [
  {
    key: 'state',
    label: 'State',
    question: 'How do you want to feel?',
    options: [
      { id: 'rs_calm', label: 'Calm' },
      { id: 'rs_energy', label: 'Energy' },
      { id: 'rs_openness', label: 'Openness' },
      { id: 'rs_confidence', label: 'Confidence' },
      { id: 'rs_presence', label: 'Presence' },
      { id: 'rs_trust', label: 'Trust' },
    ],
  },
  {
    key: 'belief',
    label: 'Belief',
    question: 'What do you want to believe instead?',
    options: [
      { id: 'rb_enough', label: 'I am enough' },
      { id: 'rb_safe', label: 'I am safe' },
      { id: 'rb_handle', label: 'I can handle this' },
      { id: 'rb_choose', label: 'I am allowed to choose myself' },
      { id: 'rb_prove', label: "I don't need to prove myself" },
      { id: 'other_belief', label: 'Other' },
    ],
  },
  {
    key: 'identity',
    label: 'Identity',
    question: 'Who do you want to be right now?',
    options: [
      { id: 'ri_leader', label: 'Grounded leader' },
      { id: 'ri_partner', label: 'Present partner' },
      { id: 'ri_creator', label: 'Courageous creator' },
      { id: 'ri_loving', label: 'Loving version of myself' },
      { id: 'ri_decider', label: 'Calm decision-maker' },
      { id: 'other_identity', label: 'Other' },
    ],
  },
  {
    key: 'response',
    label: 'Response',
    question: 'How do you want to respond?',
    options: [
      { id: 'rr_calm', label: 'Speak calmly' },
      { id: 'rr_boundary', label: 'Set a boundary' },
      { id: 'rr_action', label: 'Take action' },
      { id: 'rr_letgo', label: 'Let go' },
      { id: 'rr_support', label: 'Ask for support' },
      { id: 'rr_present', label: 'Be present' },
      { id: 'other_response', label: 'Other' },
    ],
  },
  {
    key: 'focus',
    label: 'Focus',
    question: 'Where do you want your attention to go?',
    options: [
      { id: 'rf_create', label: 'What I want to create' },
      { id: 'rf_gratitude', label: 'Gratitude' },
      { id: 'rf_opportunity', label: 'Opportunity' },
      { id: 'rf_abundance', label: 'Abundance' },
      { id: 'rf_connection', label: 'Connection' },
      { id: 'rf_possibility', label: 'Possibility' },
    ],
  },
]

const ALL_OPTIONS: Option[] = [
  ...DRAIN_OPTIONS,
  ...THOUGHT_OPTIONS,
  ...EMOTION_OPTIONS,
  ...BODY_OPTIONS,
  ...ATTENTION_OPTIONS,
  ...BEHAVIOUR_OPTIONS,
  ...PATTERN_OPTIONS,
  ...REGULATE_TARGETS,
  ...QUICK_RELEASE_OPTIONS,
  ...RELEASE_TYPES,
  ...RELEASE_ACTIONS,
  ...REWIRE_GROUPS.flatMap((g) => g.options),
]

export function labelOf(id: string): string {
  return ALL_OPTIONS.find((o) => o.id === id)?.label ?? id
}

// ─── Draft ────────────────────────────────────────────────────────────────────

export type MethodDraft = Omit<MethodCheckIn, 'id' | 'userId' | 'date' | 'createdAt'>

export const EMPTY_DRAFT: MethodDraft = {
  drains: [],
  thoughts: [],
  emotions: [],
  body: [],
  attention: [],
  behaviour: [],
  regulationRounds: 0,
  releaseTypes: [],
  releaseActions: [],
  rewireState: [],
  rewireBelief: [],
  rewireIdentity: [],
  rewireResponse: [],
  rewireFocus: [],
  practicesUsed: [],
  stepsVisited: [],
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/** Where the member is now, read from the snapshot (energy + contraction) and what they noticed. */
export function deriveCurrentState(
  energy: number | undefined,
  contraction: number | undefined,
  attention: string[]
): RegulateState | null {
  if (energy == null || contraction == null) return null
  if (contraction >= 7) return energy >= 6 ? 'charged' : 'high_activation'
  if (energy <= 4) return 'low_energy'
  if (attention.includes('scattered_att') || attention.includes('checking')) return 'scattered'
  return contraction >= 5 ? 'high_activation' : 'balanced'
}

/** Ordered list of practice slugs. First = start here. Uses where you are AND where you want to go. */
export function recommendRegulation(
  current: RegulateState | undefined,
  target: RegulateTarget | undefined,
  contraction?: number
): string[] {
  // Very contracted or charged up: move first, then calm
  const movementFirst = current === 'charged' || (contraction ?? 0) >= 8

  switch (target) {
    case 't_calm':
    case 't_grounded':
    case 't_confident':
      return movementFirst ? ['shake-for-sanity', 'regulation-breath'] : ['regulation-breath']
    case 't_energized':
      return ['shake-for-sanity']
    case 't_open':
      return movementFirst ? ['shake-for-sanity', 'regulation-breath', 'expand-breath'] : ['expand-breath']
    case 't_clear':
    case 't_focused':
      if (current === 'scattered') return ['expand-breath', 'regulation-breath']
      if (current === 'low_energy') return ['shake-for-sanity', 'expand-breath']
      return movementFirst ? ['shake-for-sanity', 'regulation-breath'] : ['regulation-breath', 'expand-breath']
    case 't_present':
      return movementFirst ? ['shake-for-sanity', 'expand-breath'] : ['expand-breath']
    default:
      break
  }

  // "Something else" or nothing chosen: route from where they are
  switch (current) {
    case 'high_activation':
      return movementFirst ? ['shake-for-sanity', 'regulation-breath'] : ['regulation-breath']
    case 'charged':
      return ['shake-for-sanity', 'regulation-breath']
    case 'low_energy':
      return ['shake-for-sanity']
    case 'scattered':
      return ['expand-breath', 'regulation-breath']
    default:
      return []
  }
}

export function recommendRelease(types: string[], actions: string[], pattern?: string): string[] {
  if (types.includes('r_nothing')) return []
  const out: string[] = []
  const wantsMovement =
    actions.some((a) => ['a_move', 'a_shake', 'a_sound'].includes(a)) ||
    types.some((t) => ['r_anger', 'r_tension', 'r_pressure'].includes(t))
  if (wantsMovement) out.push('shake-for-sanity')
  if (pattern === 'recurring' || types.includes('r_unnamed')) out.push('nova-recode')
  return out
}

export function recommendRewire(sel: Record<RewireKey, string[]>): string[] {
  const out: string[] = []
  const add = (slug: string) => {
    if (!out.includes(slug)) out.push(slug)
  }
  if (sel.belief.length) add('nova-recode')
  if (sel.focus.length) add('where-focus-goes')
  if (sel.identity.length) add('future-visualization')
  if (sel.state.length) add('affirmation-meditation')
  if (sel.response.length) add('intentional-focus')
  return out.slice(0, 2)
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export function describeNeeded(c: Pick<MethodDraft, 'state' | 'target' | 'stepsVisited'>): string {
  if (c.state && c.target) return `${STATE_SHORT[c.state]} → ${labelOf(c.target)}`
  if (c.target) return `To move toward ${labelOf(c.target).toLowerCase()}`
  switch (c.state) {
    case 'high_activation':
      return 'To settle down'
    case 'charged':
      return 'To move and burn off the charge'
    case 'low_energy':
      return 'To wake up and get moving'
    case 'scattered':
      return 'To gather your attention'
    case 'balanced':
      return 'Nothing urgent. You were already steady'
    default:
      break
  }
  if (c.stepsVisited.includes('reset')) return 'A clearer start'
  if (c.stepsVisited.includes('realize')) return 'To notice what was going on'
  return 'A moment to check in'
}

export interface MethodSummary {
  noticed: string
  needed: string
  chose: string
  strengthen: string
  nextAction: string
}

export function buildSummary(c: MethodDraft): MethodSummary {
  const feelings = [...c.emotions, ...c.body, ...c.thoughts, ...c.behaviour].slice(0, 3).map(labelOf)
  let noticed = feelings.join(' + ')
  if (c.underneath?.trim()) noticed = noticed ? `${noticed}. "${c.underneath.trim()}"` : `"${c.underneath.trim()}"`
  if (!noticed && c.situation?.trim()) noticed = c.situation.trim()

  const rewire = [
    ...c.rewireState,
    ...c.rewireBelief,
    ...c.rewireIdentity,
    ...c.rewireResponse,
    ...c.rewireFocus,
  ]
    .slice(0, 3)
    .map(labelOf)
    .join(' + ')

  return {
    noticed: noticed || 'Not recorded',
    needed: describeNeeded(c),
    chose: c.practicesUsed.length ? c.practicesUsed.map(practiceName).join(', ') : 'No practice needed this time',
    strengthen: rewire || 'Not chosen',
    nextAction: c.carryForward?.trim() || c.resetAction?.trim() || 'Not set',
  }
}

// ─── Stats (for the progress page) ────────────────────────────────────────────

export interface Tally {
  id: string
  count: number
}

function tally(lists: string[][]): Tally[] {
  const m = new Map<string, number>()
  lists.forEach((l) => l.forEach((id) => m.set(id, (m.get(id) ?? 0) + 1)))
  return Array.from(m.entries())
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
}

function avg(nums: number[]): number | null {
  if (!nums.length) return null
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
}

export interface PracticeStat {
  slug: string
  uses: number
  avgTensionShift: number | null
  avgEnergyShift: number | null
}

export interface MethodStats {
  total: number
  avgEnergyShift: number | null
  avgTensionShift: number | null
  topDrains: Tally[]
  topEmotions: Tally[]
  practiceStats: PracticeStat[]
}

export function computeMethodStats(list: MethodCheckIn[]): MethodStats {
  const energyShifts: number[] = []
  const tensionShifts: number[] = []
  list.forEach((c) => {
    if (c.energyBefore != null && c.energyAfter != null) energyShifts.push(c.energyAfter - c.energyBefore)
    if (c.tensionBefore != null && c.tensionAfter != null) tensionShifts.push(c.tensionAfter - c.tensionBefore)
  })

  const practiceStats: PracticeStat[] = tally(list.map((c) => c.practicesUsed)).map((p) => {
    const e: number[] = []
    const t: number[] = []
    list
      .filter((c) => c.practicesUsed.includes(p.id))
      .forEach((c) => {
        if (c.energyBefore != null && c.energyAfter != null) e.push(c.energyAfter - c.energyBefore)
        if (c.tensionBefore != null && c.tensionAfter != null) t.push(c.tensionAfter - c.tensionBefore)
      })
    return { slug: p.id, uses: p.count, avgTensionShift: avg(t), avgEnergyShift: avg(e) }
  })

  return {
    total: list.length,
    avgEnergyShift: avg(energyShifts),
    avgTensionShift: avg(tensionShifts),
    topDrains: tally(list.map((c) => c.drains.filter((d) => d !== 'nothing'))).slice(0, 4),
    topEmotions: tally(list.map((c) => c.emotions)).slice(0, 4),
    practiceStats,
  }
}
