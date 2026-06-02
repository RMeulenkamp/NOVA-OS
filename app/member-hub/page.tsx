'use client'

import { useAuth } from '@/lib/auth-context'
import { getSupabase } from '@/lib/supabase'
import { TopBar, BottomNav } from '@/components/Navigation'
import { Card } from '@/components/ui/Card'
import {
  Lock,
  Star,
  Zap,
  Leaf,
  Pill,
  Calendar,
  ChevronDown,
  ChevronRight,
  Phone,
  Play,
  Video,
  ExternalLink,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ProgramResource {
  week: number
  module_title: string | null
  module_video_url: string | null
  course_platform_url: string | null
  call_title: string | null
  call_recording_url: string | null
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

// ─── Week content ─────────────────────────────────────────────────────────────

const WEEKS = [
  {
    week: 1,
    title: 'Reset Begins — Loading & Start',
    phase: 'Loading Phase (2 days) → Strict Phase begins',
    focus: 'Metabolic switch activation. Your body is preparing to access fat stores.',
    keyActions: [
      'Loading phase: eat freely for 2 days — high fat, high calorie',
      'Start activator (Enerxan): before breakfast, lunch, dinner, and bedtime',
      'Day 3: switch to strict protocol — protein + veg only',
      'Drink minimum 2 litres water daily',
      'Take all supplements every morning and evening',
    ],
    supplement: 'Morning: Daily BioBasics 2 scoops + MSM 4 tabs + Antioxidants 2 tabs + OmeGold 1 cap\nEvening: MSM 4 tabs + OmeGold 1 cap',
    expect: 'Energy dip on days 3–7 is completely normal. Your metabolism is switching fuels. This passes.',
  },
  {
    week: 2,
    title: 'Strict Phase — Building Momentum',
    phase: 'Strict Phase (days 8–14)',
    focus: 'Ketosis deepening. Fat burning increases. Mental clarity often improves around day 10.',
    keyActions: [
      'Protein + approved vegetables at every meal',
      'Breakfast: 30g protein shake with water',
      'Lunch: 120g protein + veg/salad (unlimited)',
      'Dinner: 110g protein + veg/salad (unlimited)',
      'Optional: 1 piece fruit mid-morning OR afternoon (not both)',
    ],
    supplement: 'Same as week 1 — consistency is key. Missing supplements = more cravings.',
    expect: 'Cravings reduce significantly by day 10–12. Energy begins to stabilise. Some weight loss visible.',
  },
  {
    week: 3,
    title: 'Strict Phase — Completion',
    phase: 'Strict Phase (days 15–21)',
    focus: 'The hypothalamus is resetting. Stay consistent — this is the critical window.',
    keyActions: [
      'Continue exact same protocol as weeks 1–2',
      'If you cheated, extend by 3 days per cheat — do not restart',
      'No alcohol, no sugar, no bread, no pasta, no potatoes',
      'Weight may plateau — this is normal, not failure',
      'If strong cravings hit: take extra protein shake first',
    ],
    supplement: 'Same as weeks 1–2.',
    expect: 'Stable, clean energy without afternoon crashes is common by now. You may not feel hungry. Trust the process.',
  },
  {
    week: 4,
    title: 'Stabilisation Begins',
    phase: 'Stabilisation Phase — Week 1',
    focus: 'The hypothalamus learns its new set point. Healthy fats are reintroduced.',
    keyActions: [
      'Stop the activator. Eat as before for 2 more days.',
      'Day 3 of stabilisation: weigh yourself — this is your new set point',
      'Begin adding healthy fats: olive oil, avocado, nuts, cheese',
      'Increase protein portions if desired',
      'Still NO carbohydrates (bread, rice, pasta, potatoes) or sugar',
    ],
    supplement: 'Morning: Daily BioBasics 2 scoops + optional MSM + Antioxidants 2 tabs + OmeGold 1 cap\nEvening: optional MSM + OmeGold 1 cap',
    expect: 'This phase often feels easier and more energising. The key is maintaining carb discipline while fats return.',
  },
  {
    week: 5,
    title: 'Stabilisation — Deepening',
    phase: 'Stabilisation Phase — Week 2',
    focus: 'Your body is establishing new metabolic flexibility. Energy becomes more consistent.',
    keyActions: [
      'Maintain zero carbohydrates and zero sugar',
      'Diversify protein sources: dairy, eggs, legumes now OK',
      'Add more fruit varieties',
      'First cold-pressed oils can be added (olive, linseed)',
      'Watch your weight — small fluctuations of 1 kg are normal',
    ],
    supplement: 'Same as week 4.',
    expect: 'Many people report this as their best energy phase. The new metabolic baseline is establishing.',
  },
  {
    week: 6,
    title: 'Stabilisation — Completion',
    phase: 'Stabilisation Phase — Week 3',
    focus: 'Locking in the new set point. This is where lasting results are built.',
    keyActions: [
      'Continue stabilisation protocol through the full 21 days',
      'Begin observing how different foods affect your energy',
      'Prepare mentally for the Test Phase — gradual reintroduction',
      'Continue all supplements',
      'Alcohol still not recommended',
    ],
    supplement: 'Same as weeks 4–5.',
    expect: 'The new energy baseline is now becoming your normal. Note any patterns — what supports it, what drains it.',
  },
  {
    week: 7,
    title: 'Test Phase & Integration',
    phase: 'Test Phase begins (3+ months)',
    focus: 'Finding your personal optimal diet. Learning your individual food responses.',
    keyActions: [
      'Gradually add: more vegetables → more fruit → bread → potatoes → rice → pasta',
      'Add one new food type at a time — observe your body response for 2–3 days',
      'Stay within 2–3 kg of your set point',
      'Continue taking basic supplements daily',
      'If weight climbs: return to stabilisation protocol immediately',
    ],
    supplement: 'Maintenance: Multivitamin 2 tabs morning/midday/evening + MSM 4 tabs morning & evening + Antioxidants 2 tabs morning + Omega-3 morning & evening',
    expect: 'This is lifelong learning. You now know how your metabolism works. Use that knowledge.',
  },
]

// ─── Packages ─────────────────────────────────────────────────────────────────

const PACKAGES = [
  {
    name: 'Budget Package',
    image: '/package-budget.png',
    includes: ['Daily BioBasics', 'Triple Protein (or Vegan)', 'MSM Plus', 'Proanthenols 100'],
    optional: 'Enerxan (optional for weight loss)',
  },
  {
    name: 'Standard Package',
    image: null,
    includes: ['Daily BioBasics', 'Triple Protein (or Vegan)', 'Proanthenols 100', 'MSM Plus', 'OmeGold (or Vegan)', 'X-Cell'],
    optional: 'Enerxan (optional for weight loss)',
  },
  {
    name: 'Full Package',
    image: '/package-full.png',
    includes: ['Daily BioBasics', 'Triple Protein (or Vegan)', 'Proanthenols 100', 'MSM Plus', 'OmeGold (or Vegan)', 'X-Cell', '+ additional support products'],
    optional: 'Enerxan (optional for weight loss)',
  },
]

// ─── Supplement quick reference ───────────────────────────────────────────────

const SUPPLEMENTS = [
  {
    name: 'Daily BioBasics / Daily Plus',
    role: 'Complete cellular nutrition — vitamins, minerals, trace elements, fibre, probiotics, antioxidants',
    when: '2 scoops in water, morning',
    phase: 'All phases',
  },
  {
    name: 'Enerxan (Activator)',
    role: 'Supports fat metabolism, natural energy activation, appetite regulation',
    when: 'Before meals and bedtime — loading + strict phase only',
    phase: 'Weeks 1–3',
  },
  {
    name: 'Triple Protein / Vegan Protein',
    role: 'Primary protein source, satiation, muscle preservation, fat burning support',
    when: 'Breakfast shake + as needed for cravings',
    phase: 'All phases',
  },
  {
    name: 'MSM Plus (Organic Sulphur)',
    role: 'Detoxification, toxin binding, joint/connective tissue, metabolism stimulation',
    when: '4 tablets morning + 4 tablets evening',
    phase: 'All phases (especially strict)',
  },
  {
    name: 'Proanthenols 100 (Antioxidants)',
    role: 'OPC antioxidant — cellular protection during detox, blood circulation, immune support',
    when: '2 tablets morning, 30 min before meal',
    phase: 'All phases',
  },
  {
    name: 'OmeGold / Vegan OmeGold',
    role: 'Omega-3 (DHA/EPA) — brain metabolism, mood, hormones, anti-inflammatory',
    when: '1 capsule morning + 1 capsule evening',
    phase: 'All phases + maintenance',
  },
]

// ─── Locked view ──────────────────────────────────────────────────────────────

function LockedHub() {
  return (
    <div className="py-8 px-4 space-y-6 animate-fade-in max-w-lg mx-auto">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-nova-accent/10 border border-nova-accent/20 flex items-center justify-center">
          <Lock className="w-7 h-7 text-nova-accent" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-nova-text-bright">Member Hub</h2>
          <p className="text-sm text-nova-muted mt-2 leading-relaxed max-w-sm mx-auto">
            This section is exclusive to participants of the 7-week Abundant Energy Reset program.
          </p>
        </div>
      </div>

      {/* What's inside teaser */}
      <Card className="border border-nova-accent/20 bg-nova-accent/5 space-y-4">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-nova-accent" />
          <span className="text-sm font-semibold text-nova-text-bright">What's inside</span>
        </div>
        <div className="space-y-3">
          {[
            { icon: Calendar, label: 'Week-by-week program guide', desc: 'Exact protocol for every phase of the reset' },
            { icon: Pill, label: 'Supplement schedule', desc: 'When and how much to take in each phase' },
            { icon: Leaf, label: 'Approved food lists', desc: 'What to eat — and what to avoid — per phase' },
            { icon: Zap, label: 'Energy protocols', desc: 'NOVA-specific tools for every week of the program' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-nova-surface border border-nova-border flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-nova-muted" />
              </div>
              <div>
                <p className="text-sm font-medium text-nova-text">{label}</p>
                <p className="text-xs text-nova-dim mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* CTA */}
      <Card className="space-y-4 border border-nova-border">
        <div>
          <p className="text-sm font-semibold text-nova-text-bright">Ready to join the program?</p>
          <p className="text-xs text-nova-muted mt-1 leading-relaxed">
            The 7-week Abundant Energy Reset addresses all 3 levers simultaneously — biology, conscious patterns, and nervous system regulation.
          </p>
        </div>
        <a
          href="https://www.nova-method.com/clarity-call"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-nova-accent/10 border border-nova-accent/30 hover:bg-nova-accent/20 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-nova-accent" />
            <span className="text-sm font-medium text-nova-text-bright">Schedule a Clarity Call</span>
          </div>
          <ChevronRight className="w-4 h-4 text-nova-accent" />
        </a>
        <p className="text-xs text-nova-dim text-center">Free 30-minute call with Ruben to see if the program is right for you</p>
      </Card>
    </div>
  )
}

// ─── Week accordion item ──────────────────────────────────────────────────────

function WeekItem({ data, isCurrentWeek, resource }: { data: typeof WEEKS[0]; isCurrentWeek: boolean; resource?: ProgramResource }) {
  const [open, setOpen] = useState(isCurrentWeek)
  const [activeVideo, setActiveVideo] = useState<'module' | 'call' | null>(null)

  return (
    <div className={cn(
      'rounded-xl border transition-all duration-200',
      isCurrentWeek
        ? 'border-nova-accent/40 bg-nova-accent/5'
        : 'border-nova-border bg-nova-card'
    )}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
            isCurrentWeek
              ? 'bg-nova-accent text-nova-bg'
              : 'bg-nova-surface border border-nova-border text-nova-muted'
          )}>
            {data.week}
          </div>
          <div>
            <p className={cn('text-sm font-semibold', isCurrentWeek ? 'text-nova-text-bright' : 'text-nova-text')}>
              {data.title}
            </p>
            <p className="text-xs text-nova-dim mt-0.5">{data.phase}</p>
          </div>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-nova-muted flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-nova-border/50 pt-3">
          {/* Focus */}
          <p className="text-sm text-nova-text leading-relaxed">{data.focus}</p>

          {/* Actions */}
          <div>
            <p className="text-xs text-nova-dim uppercase tracking-wider mb-2">This week's actions</p>
            <div className="space-y-1.5">
              {data.keyActions.map((action, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-nova-accent mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-nova-muted leading-relaxed">{action}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Supplements */}
          <div className="bg-nova-surface rounded-lg p-3 border border-nova-border">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Pill className="w-3.5 h-3.5 text-nova-accent" />
              <p className="text-xs font-medium text-nova-text-bright">Supplements</p>
            </div>
            <p className="text-xs text-nova-muted leading-relaxed whitespace-pre-line">{data.supplement}</p>
          </div>

          {/* What to expect */}
          <div className="bg-nova-accent/5 rounded-lg p-3 border border-nova-accent/20">
            <p className="text-xs font-medium text-nova-accent mb-1">What to expect</p>
            <p className="text-xs text-nova-muted leading-relaxed">{data.expect}</p>
          </div>

          {/* Resources */}
          <div className="space-y-2">
            <p className="text-xs text-nova-dim uppercase tracking-wider">Resources</p>

            {/* Module intro video */}
            {resource?.module_video_url ? (
              <div className="rounded-xl overflow-hidden border border-nova-border bg-nova-surface">
                <div className="px-3 py-2 flex items-center justify-between border-b border-nova-border">
                  <div className="flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-nova-accent" />
                    <span className="text-xs font-medium text-nova-text-bright">
                      {resource.module_title ?? `Week ${data.week} — Module Intro`}
                    </span>
                  </div>
                  {resource.course_platform_url && (
                    <a
                      href={resource.course_platform_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-nova-accent hover:underline"
                    >
                      Full course <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                {activeVideo === 'module' ? (
                  <div className="aspect-video">
                    <iframe
                      src={`https://player.vimeo.com/video/${extractVimeoId(resource.module_video_url)}?autoplay=1&title=0&byline=0&portrait=0`}
                      className="w-full h-full"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveVideo('module')}
                    className="w-full aspect-video bg-nova-bg flex items-center justify-center hover:bg-nova-surface/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-nova-accent/20 border border-nova-accent/40 flex items-center justify-center">
                      <Play className="w-5 h-5 text-nova-accent ml-0.5" />
                    </div>
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-nova-border p-4 flex items-center gap-3 opacity-50">
                <Play className="w-4 h-4 text-nova-dim" />
                <p className="text-xs text-nova-dim">Module intro video — coming soon</p>
              </div>
            )}

            {/* Call recording */}
            {resource?.call_recording_url ? (
              <div className="rounded-xl overflow-hidden border border-nova-border bg-nova-surface">
                <div className="px-3 py-2 flex items-center gap-2 border-b border-nova-border">
                  <Video className="w-3.5 h-3.5 text-nova-teal" />
                  <span className="text-xs font-medium text-nova-text-bright">
                    {resource.call_title ?? `Week ${data.week} — Call Recording`}
                  </span>
                </div>
                {activeVideo === 'call' ? (
                  <div className="aspect-video">
                    <iframe
                      src={`https://player.vimeo.com/video/${extractVimeoId(resource.call_recording_url)}?autoplay=1&title=0&byline=0&portrait=0`}
                      className="w-full h-full"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveVideo('call')}
                    className="w-full aspect-video bg-nova-bg flex items-center justify-center hover:bg-nova-surface/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-nova-teal/20 border border-nova-teal/40 flex items-center justify-center">
                      <Play className="w-5 h-5 text-nova-teal ml-0.5" />
                    </div>
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-nova-border p-4 flex items-center gap-3 opacity-50">
                <Video className="w-4 h-4 text-nova-dim" />
                <p className="text-xs text-nova-dim">Call recording — uploaded after the live call</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MemberHubPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'program' | 'supplements'>('program')
  const [resources, setResources] = useState<Record<number, ProgramResource>>({})

  const inProgram = user?.inProgram
  const programWeek = user?.programWeek ?? 1

  useEffect(() => {
    const sb = getSupabase()
    if (!sb || !inProgram) return
    sb.from('program_resources')
      .select('*')
      .then(({ data }) => {
        if (!data) return
        const map: Record<number, ProgramResource> = {}
        data.forEach((r: ProgramResource) => { map[r.week] = r })
        setResources(map)
      })
  }, [inProgram])

  if (!inProgram) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar title="Member Hub" subtitle="Abundant Energy Reset" />
        <div className="flex-1 overflow-y-auto pb-24">
          <LockedHub />
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar
        title="Member Hub"
        subtitle={`Week ${programWeek} of 7 — ${programWeek <= 3 ? 'Strict Phase' : programWeek <= 6 ? 'Stabilisation Phase' : 'Test Phase'}`}
      />

      <div className="flex-1 overflow-y-auto pb-24 max-w-lg mx-auto w-full">
        {/* Progress bar */}
        <div className="px-4 pt-4">
          <div className="h-1.5 bg-nova-surface rounded-full border border-nova-border">
            <div
              className="h-full bg-gradient-to-r from-nova-accent to-purple-400 rounded-full transition-all duration-500"
              style={{ width: `${(programWeek / 7) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-xs text-nova-dim">Week 1</p>
            <p className="text-xs text-nova-accent font-medium">Week {programWeek}</p>
            <p className="text-xs text-nova-dim">Week 7</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-4">
          <div className="flex gap-2 p-1 bg-nova-surface rounded-xl border border-nova-border">
            {(['program', 'supplements'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  activeTab === tab
                    ? 'bg-nova-accent text-nova-bg shadow-sm'
                    : 'text-nova-muted hover:text-nova-text'
                )}
              >
                {tab === 'program' ? 'Program Guide' : 'Supplements'}
              </button>
            ))}
          </div>
        </div>

        {/* Program Guide tab */}
        {activeTab === 'program' && (
          <div className="px-4 pt-4 pb-4 space-y-3">
            {WEEKS.map((week) => (
              <WeekItem
                key={week.week}
                data={week}
                isCurrentWeek={week.week === programWeek}
                resource={resources[week.week]}
              />
            ))}
          </div>
        )}

        {/* Supplements tab */}
        {activeTab === 'supplements' && (
          <div className="px-4 pt-4 pb-4 space-y-4">
            <p className="text-xs text-nova-dim leading-relaxed px-1">
              Lifeplus supplements are cold-processed to preserve enzyme and vitamin potency. Consistency matters more than perfection.
            </p>

            {/* Your package */}
            <div>
              <p className="text-xs text-nova-dim uppercase tracking-wider mb-2 px-1">Your package</p>
              <div className="space-y-3">
                {PACKAGES.map((pkg) => (
                  <Card key={pkg.name} className="space-y-3">
                    <p className="text-sm font-semibold text-nova-text-bright">{pkg.name}</p>
                    {pkg.image && (
                      <img
                        src={pkg.image}
                        alt={pkg.name}
                        className="w-full rounded-lg object-contain max-h-40 bg-white"
                      />
                    )}
                    <div className="space-y-1">
                      {pkg.includes.map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-nova-accent flex-shrink-0" />
                          <p className="text-xs text-nova-muted">{item}</p>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 opacity-60">
                        <div className="w-1.5 h-1.5 rounded-full bg-nova-dim flex-shrink-0" />
                        <p className="text-xs text-nova-dim italic">{pkg.optional}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <p className="text-xs text-nova-dim uppercase tracking-wider px-1 pt-2">Supplement guide</p>
            {SUPPLEMENTS.map((supp) => (
              <Card key={supp.name} className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-nova-text-bright leading-tight">{supp.name}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-nova-accent/10 text-nova-accent border border-nova-accent/20 flex-shrink-0 font-medium">
                    {supp.phase}
                  </span>
                </div>
                <p className="text-xs text-nova-muted leading-relaxed">{supp.role}</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-nova-accent flex-shrink-0" />
                  <p className="text-xs text-nova-dim">{supp.when}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
